Safely delete old eks–related **non-default** security groups, automatically removing references from other SGs first.

---

## TL;DR

1. **Default SG cannot be deleted** (only rules can be cleared).  
2. Ensure **no ENI is attached** to the target SG.  
3. Use the **cleanup script v2**:  
   - Removes **ingress/egress references** from other SGs (including self-references).  
   - Deletes the SG once clean.  
4. If you hit `DependencyViolation`:  
   - Re-run the script, or check if the SG is still used by **ELB/NLB, VPC Endpoints, RDS, or EFS**.  

---

## Requirements

- **awscli** installed and authenticated with the correct profile/region  
- **jq** installed  
- Export environment variables:  

```bash
export REGION=ap-southeast-2
export PROFILE=root
```

---

## Cleanup Script

Save as `sg-force-delete.sh`.  
Supports **dry-run mode**: set `DRY_RUN=true` to preview changes without executing them.  

```bash
#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   REGION=ap-southeast-2 PROFILE=root ./sg-force-delete.sh sg-aaa sg-bbb ...
#   DRY_RUN=true REGION=ap-southeast-2 PROFILE=root ./sg-force-delete.sh sg-aaa sg-bbb ...

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

  SG_JSON=$(aws ec2 describe-security-groups     --group-ids "$TARGET_SG"     --region "$REGION" --profile "$PROFILE" --output json 2>/dev/null || true)

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

## Usage

```bash
chmod +x sg-force-delete.sh

# Normal mode
./sg-force-delete.sh sg-aaa sg-bbb

# Dry-run mode (safe preview)
DRY_RUN=true ./sg-force-delete.sh sg-aaa sg-bbb
```

---

## Pre-checks Before Deleting

```bash
# Check ENI attachment (0 = safe)
aws ec2 describe-network-interfaces   --filters "Name=group-id,Values=<sg-id>"   --region $REGION --profile $PROFILE   --output json | jq '.NetworkInterfaces | length'

# Check SG details to avoid deleting new ones
aws ec2 describe-security-groups   --group-ids <sg-id>   --region $REGION --profile $PROFILE   --output table
```

---

## Common Errors & Fixes

- **`DependencyViolation`**  
  → Re-run script; if persistent, check for references in **ELB/NLB, VPC Endpoints, RDS, EFS**.  

- **`AuthFailure`**  
  → Verify `--profile` and `--region`; confirm identity with:  
    ```bash
    aws sts get-caller-identity
    ```

- **Accidental deletion risk**  
  → Always check **GroupName, creation time, and Tags (`aws:eks:cluster-name`)** to confirm it’s an old resource.  
