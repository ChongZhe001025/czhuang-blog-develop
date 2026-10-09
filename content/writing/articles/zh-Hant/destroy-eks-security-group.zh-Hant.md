安全刪除舊的 EKS 相關**非預設安全群組**，並先移除其他安全群組對它的引用。

---

## 快速重點

1. **預設安全群組無法刪除**（只能清除其中的規則）。
2. 確認目標安全群組沒有附掛任何 ENI。
3. 使用 cleanup script v2：
   - 移除其他安全群組中對目標群組的輸入／輸出規則引用，包含自我引用。
   - 引用清除後，再刪除安全群組。
4. 若遇到 `DependencyViolation`：
   - 重新執行腳本；若問題持續，檢查 ELB／NLB、VPC Endpoint、RDS 或 EFS 是否仍在使用該群組。

---

## 需求條件

- 已安裝 `awscli`，並使用正確的 Profile 與 Region 完成驗證。
- 已安裝 `jq`。
- 設定環境變數：

```bash
export REGION="your-aws-region"
export PROFILE="your-aws-profile"
```


---

## 清理腳本

將檔案儲存為 `sg-force-delete.sh`。
支援 Dry Run：設定 `DRY_RUN=true` 可預覽預計執行的變更，不會實際操作。

```bash
#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   REGION=your-aws-region PROFILE=your-aws-profile ./sg-force-delete.sh sg-aaa sg-bbb ...
#   DRY_RUN=true REGION=your-aws-region PROFILE=your-aws-profile ./sg-force-delete.sh sg-aaa sg-bbb ...

REGION="${REGION:-ap-southeast-2}"
PROFILE="${PROFILE:-default}"
DRY_RUN="${DRY_RUN:-false}"

command -v jq >/dev/null 2>&1 || { echo "Please install jq first"; exit 1; }

# Build ingress permissions referencing target SG
build_ingress_perms() {
  local ref_json="$1" target_sg="$2"
  echo "$ref_json" | jq --arg SG "$target_sg" '
    (.SecurityGroups[0].IpPermissions // [])
    | map(
        . as $p
        | ($p.UserIdGroupPairs // [])
        | map(select(.GroupId == $SG))
        | select(length > 0)
        | { IpProtocol: $p.IpProtocol }
          + (if $p.FromPort != null then { FromPort: $p.FromPort, ToPort: $p.ToPort } else {} end)
          + { UserIdGroupPairs: . }
      )
  '
}

# Build egress permissions referencing target SG
build_egress_perms() {
  local ref_json="$1" target_sg="$2"
  echo "$ref_json" | jq --arg SG "$target_sg" '
    (.SecurityGroups[0].IpPermissionsEgress // [])
    | map(
        . as $p
        | ($p.UserIdGroupPairs // [])
        | map(select(.GroupId == $SG))
        | select(length > 0)
        | { IpProtocol: $p.IpProtocol }
          + (if $p.FromPort != null then { FromPort: $p.FromPort, ToPort: $p.ToPort } else {} end)
          + { UserIdGroupPairs: . }
      )
  '
}

for TARGET_SG in "$@"; do
  echo "===================================================="
  echo "Target SG: $TARGET_SG   (Region=$REGION Profile=$PROFILE)"
  echo "----------------------------------------------------"

  if ! SG_JSON=$(aws ec2 describe-security-groups \
      --group-ids "$TARGET_SG" \
      --region "$REGION" --profile "$PROFILE" --output json); then
    echo "Failed to describe $TARGET_SG; check permissions, account and region." >&2
    exit 1
  fi

  if [[ -z "$SG_JSON" || "$SG_JSON" == "null" || $(echo "$SG_JSON" | jq '.SecurityGroups | length') -eq 0 ]]; then
    echo "SG $TARGET_SG not found (already deleted, wrong region/account). Skipping."
    continue
  fi

  SG_NAME=$(echo "$SG_JSON" | jq -r '.SecurityGroups[0].GroupName')
  VPC_ID=$(echo "$SG_JSON" | jq -r '.SecurityGroups[0].VpcId')

  if [[ "$SG_NAME" == "default" ]]; then
    echo "⏭$TARGET_SG is a default SG. Cannot delete. Skipping."
    continue
  fi

  echo "Name: $SG_NAME   VPC: $VPC_ID"

  # Check ENIs
  ENI_CNT=$(aws ec2 describe-network-interfaces     --filters "Name=group-id,Values=$TARGET_SG"     --region "$REGION" --profile "$PROFILE" --output json | jq '.NetworkInterfaces | length')
  echo "ENI attachments: $ENI_CNT"
  if [[ "$ENI_CNT" -gt 0 ]]; then
    echo "$TARGET_SG is still attached to ENIs. Please detach first."
    continue
  fi

  # Find referencing SGs
  IN_REF_JSON=$(aws ec2 describe-security-groups     --filters "Name=ip-permission.group-id,Values=$TARGET_SG"     --region "$REGION" --profile "$PROFILE" --output json)

  OUT_REF_JSON=$(aws ec2 describe-security-groups     --filters "Name=egress.ip-permission.group-id,Values=$TARGET_SG"     --region "$REGION" --profile "$PROFILE" --output json)

  IN_SG_IDS=($(echo "$IN_REF_JSON"  | jq -r '.SecurityGroups[]?.GroupId'))
  OUT_SG_IDS=($(echo "$OUT_REF_JSON" | jq -r '.SecurityGroups[]?.GroupId'))

  [[ " ${IN_SG_IDS[*]} " != *" $TARGET_SG "* ]] && IN_SG_IDS+=("$TARGET_SG")
  [[ " ${OUT_SG_IDS[*]} " != *" $TARGET_SG "* ]] && OUT_SG_IDS+=("$TARGET_SG")

  # Revoke ingress
  if [[ ${#IN_SG_IDS[@]} -gt 0 ]]; then
    echo "Revoking Ingress from: ${IN_SG_IDS[*]}"
    for REF_SG in "${IN_SG_IDS[@]}"; do
      REF_JSON=$(aws ec2 describe-security-groups --group-ids "$REF_SG"         --region "$REGION" --profile "$PROFILE" --output json)
      PERMS=$(build_ingress_perms "$REF_JSON" "$TARGET_SG")
      if [[ $(echo "$PERMS" | jq 'length') -gt 0 ]]; then
        if [[ "$DRY_RUN" == "true" ]]; then
          echo "  (dry-run) Would revoke ingress from $REF_SG"
        else
          aws ec2 revoke-security-group-ingress             --group-id "$REF_SG"             --ip-permissions "$PERMS"             --region "$REGION" --profile "$PROFILE"
          echo " Revoked ingress from $REF_SG"
        fi
      fi
    done
  else
    echo "No ingress references"
  fi

  # Revoke egress
  if [[ ${#OUT_SG_IDS[@]} -gt 0 ]]; then
    echo " Revoking Egress from: ${OUT_SG_IDS[*]}"
    for REF_SG in "${OUT_SG_IDS[@]}"; do
      REF_JSON=$(aws ec2 describe-security-groups --group-ids "$REF_SG"         --region "$REGION" --profile "$PROFILE" --output json)
      PERMS=$(build_egress_perms "$REF_JSON" "$TARGET_SG")
      if [[ $(echo "$PERMS" | jq 'length') -gt 0 ]]; then
        if [[ "$DRY_RUN" == "true" ]]; then
          echo "  (dry-run) Would revoke egress from $REF_SG"
        else
          aws ec2 revoke-security-group-egress             --group-id "$REF_SG"             --ip-permissions "$PERMS"             --region "$REGION" --profile "$PROFILE"
          echo "  Revoked egress from $REF_SG"
        fi
      fi
    done
  else
    echo "✔️ No egress references"
  fi

  # Attempt deletion
  if [[ "$DRY_RUN" == "true" ]]; then
    echo "(dry-run) Would delete $TARGET_SG"
  else
    echo "Attempting to delete $TARGET_SG ..."
    aws ec2 delete-security-group       --group-id "$TARGET_SG"       --region "$REGION" --profile "$PROFILE"
    echo "Deleted: $TARGET_SG"
  fi
done
```


---

## 使用方式

```bash
chmod +x sg-force-delete.sh

# Normal mode
./sg-force-delete.sh sg-aaa sg-bbb

# Dry-run mode (safe preview)
DRY_RUN=true ./sg-force-delete.sh sg-aaa sg-bbb
```


---

## 刪除前檢查

正式執行前，使用 `aws sts get-caller-identity` 確認呼叫者帳戶，並核對 Region、VPC、安全群組名稱與 EKS 標籤。`DRY_RUN=true` 只會驗證預計執行的動作，無法證明 AWS 一定會接受規則撤銷或刪除。正式執行後，再查詢一次安全群組，確認它已不存在。若刪除回傳 `DependencyViolation`，保留完整 AWS 錯誤內容並繼續找出服務附掛，不要無限重試。

不要把所有 `describe-security-groups` 失敗都當成「找不到資源」。工作階段過期、存取遭拒或 Region 錯誤，都與群組已刪除不同。此腳本遇到任何 AWS 查詢失敗都會停止；若 AWS 回傳 `InvalidGroup.NotFound`，應先核對呼叫者帳戶與 Region，再記錄目標已不存在。

---

## 常見錯誤與處理方式

- **`DependencyViolation`（相依性錯誤）**
  → 重新執行腳本；若問題持續，檢查 ELB／NLB、VPC Endpoint、RDS 或 EFS 是否仍有引用。

- **`AuthFailure`（驗證失敗）**
  → 確認 `--profile` 與 `--region`，並使用以下指令確認目前身分：

```bash
# Check ENI attachment (0 = safe)
aws ec2 describe-network-interfaces   --filters "Name=group-id,Values=<sg-id>"   --region $REGION --profile $PROFILE   --output json | jq '.NetworkInterfaces | length'

# Check SG details to avoid deleting new ones
aws ec2 describe-security-groups   --group-ids <sg-id>   --region $REGION --profile $PROFILE   --output table
```


- **誤刪風險**
  → 刪除前務必檢查 `GroupName`、建立時間與標籤（`aws:eks:cluster-name`），確認它是舊資源。

## 證據與操作限制

清理邏輯會略過預設群組及仍附掛 ENI 的群組，移除輸入／輸出的安全群組引用後，再提出刪除請求。Dry Run 成功只代表預計執行的動作已通過檢查。請保留 `delete-security-group` 的 AWS CLI 回應，以及後續 `describe-security-groups` 的查詢結果作為完成證據。現有 Codex 對話紀錄沒有證明曾實際刪除 EKS 安全群組的獨立事件，因此不應將這套程序描述為已確認的線上清理成果。
