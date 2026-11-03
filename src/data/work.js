module.exports = [
    {
        "id": "01",
        "slug": "schema-compatibility-ci",
        "title": "Cross-Repository Schema Compatibility CI",
        "category": "Implementation",
        "discipline": "CI/CD · Database Reliability · Automation",
        "technologies": [
            "GitHub Actions",
            "Python",
            "Go Modules",
            "SQL",
            "Git"
        ],
        "status": "Implemented & tested",
        "statusDetail": "Merge gate coverage pending",
        "summary": "A CI validation workflow for shared-module alignment, migration integrity, and database schema compatibility across repositories.",
        "featured": true,
        "contentFile": "content/work/schema-compatibility-ci.md",
        "contentFileZh": "content/work/zh-Hant/schema-compatibility-ci.zh-Hant.md"
    },
    {
        "id": "02",
        "slug": "aws-asg-scaling-policies",
        "title": "AWS Auto Scaling Policies & Capacity Scheduling",
        "category": "Implementation",
        "discipline": "AWS Infrastructure · Reliability Engineering · Capacity Management",
        "technologies": [
            "AWS CDK",
            "EC2 Auto Scaling",
            "CloudWatch",
            "Mixed Instances Policy",
            "Spot"
        ],
        "status": "Implemented & partially validated",
        "statusDetail": "Production state not verified",
        "summary": "A CDK-based EC2 Auto Scaling design combining reactive CPU and network controls with scheduled capacity planning.",
        "featured": true,
        "contentFile": "content/work/aws-asg-scaling-policies.md",
        "contentFileZh": "content/work/zh-Hant/aws-asg-scaling-policies.zh-Hant.md"
    },
    {
        "id": "03",
        "slug": "self-hosted-github-runners",
        "title": "Self-Hosted GitHub Actions Runner Platform",
        "category": "Implementation",
        "discipline": "Platform Engineering · CI/CD · Kubernetes",
        "technologies": [
            "GitHub Actions",
            "Actions Runner Controller",
            "Kubernetes",
            "Terraform",
            "Docker",
            "Nginx",
            "PostgreSQL",
            "Redis",
            "Google Compute Engine"
        ],
        "status": "Implemented & partially validated",
        "statusDetail": "Production validation incomplete",
        "summary": "Platform work spanning self-hosted runners and a shared development host that routes engineers to separate branch sites over common ingress and data services.",
        "featured": true,
        "contentFile": "content/work/self-hosted-github-runners.md",
        "contentFileZh": "content/work/zh-Hant/self-hosted-github-runners.zh-Hant.md"
    },
    {
        "id": "04",
        "slug": "bigquery-cdc-architecture",
        "title": "BigQuery Infrastructure as Code & CDC Architecture",
        "category": "Architecture & Design",
        "discipline": "Data Infrastructure · Cloud Architecture · Infrastructure as Code",
        "technologies": [
            "BigQuery",
            "Terraform",
            "Datastream",
            "AlloyDB",
            "Private Service Connect"
        ],
        "status": "Architecture implemented in code",
        "statusDetail": "Deployment validation pending",
        "summary": "Scope-aware BigQuery and CDC infrastructure design with regional ownership, private connectivity, and reusable Terraform compositions.",
        "contentFile": "content/work/bigquery-cdc-architecture.md",
        "contentFileZh": "content/work/zh-Hant/bigquery-cdc-architecture.zh-Hant.md"
    },
    {
        "id": "05",
        "slug": "aws-ec2-ami-automation",
        "title": "AWS EC2 Deployment & AMI Automation",
        "category": "Implementation",
        "discipline": "AWS Infrastructure · Deployment Automation",
        "technologies": [
            "EC2",
            "AMI",
            "AWS CLI",
            "Bash",
            "AWS CDK",
            "IAM",
            "SSM"
        ],
        "status": "Scripts implemented",
        "statusDetail": "End-to-end rollout pending",
        "summary": "A two-stage EC2 and AMI workflow that discovers launch settings from an active Auto Scaling Group, hands image-build parameters between scripts, and screens old images before cleanup.",
        "contentFile": "content/work/aws-ec2-ami-automation.md",
        "contentFileZh": "content/work/zh-Hant/aws-ec2-ami-automation.zh-Hant.md"
    },
    {
        "id": "06",
        "slug": "multi-country-gcp-architecture",
        "title": "Multi-Country GCP Infrastructure Architecture",
        "category": "Architecture & Design",
        "discipline": "Cloud Architecture · Infrastructure as Code",
        "technologies": [
            "GCP",
            "GKE",
            "AlloyDB",
            "VPC",
            "Terraform",
            "PostgreSQL",
            "Redis"
        ],
        "status": "Architecture design & incremental implementation",
        "statusDetail": "Rollout scope not fully validated",
        "summary": "A multi-country GCP design that separates global control functions from country runtime, paired with staged Terraform rollouts in selected non-production regions.",
        "contentFile": "content/work/multi-country-gcp-architecture.md",
        "contentFileZh": "content/work/zh-Hant/multi-country-gcp-architecture.zh-Hant.md"
    },
    {
        "id": "07",
        "slug": "datastream-cdc-consistency",
        "title": "Datastream CDC Reliability & Data Consistency Investigation",
        "category": "Reliability & Operations",
        "discipline": "Data Reliability · Incident Investigation",
        "technologies": [
            "Datastream",
            "BigQuery",
            "PostgreSQL",
            "CDC"
        ],
        "status": "Incident investigated",
        "statusDetail": "Full historical recovery unverified",
        "summary": "A CDC reliability investigation comparing stream health, backfill signals, source access, and destination data to reason about end-to-end completeness.",
        "contentFile": "content/work/datastream-cdc-consistency.md",
        "contentFileZh": "content/work/zh-Hant/datastream-cdc-consistency.zh-Hant.md"
    },
    {
        "id": "08",
        "slug": "vendor-environment-design",
        "title": "Secure Vendor Development Environment Design",
        "category": "Architecture & Design",
        "discipline": "Infrastructure Security · Developer Platform",
        "technologies": [
            "GCP",
            "GitHub",
            "Terraform",
            "IAM",
            "CI/CD",
            "PostgreSQL",
            "Redis"
        ],
        "status": "Architecture designed",
        "statusDetail": "Partial IAM implementation",
        "summary": "An isolation and access-governance design for external developers, with only part of the IAM configuration implemented and statically validated.",
        "detailUrl": "/vendor-collaboration-environment/",
        "contentFile": "content/work/vendor-environment-design.md",
        "contentFileZh": "content/work/zh-Hant/vendor-environment-design.zh-Hant.md"
    },
    {
        "id": "09",
        "slug": "cloud-observability-alerting",
        "title": "Cloud Observability & Alerting Infrastructure",
        "category": "Reliability & Operations",
        "discipline": "Reliability Engineering · Observability",
        "technologies": [
            "Prometheus",
            "Alertmanager",
            "Grafana",
            "AWS Lambda",
            "Secrets Manager",
            "S3"
        ],
        "status": "Partially implemented",
        "statusDetail": "End-to-end validation pending",
        "summary": "Monitoring changes and design reviews for alert delivery and centralized logs across Kubernetes and AWS.",
        "contentFile": "content/work/cloud-observability-alerting.md",
        "contentFileZh": "content/work/zh-Hant/cloud-observability-alerting.zh-Hant.md"
    },
    {
        "id": "10",
        "slug": "mqtt-wss-architecture-assessment",
        "title": "MQTT Infrastructure & WebSocket Architecture Assessment",
        "category": "Reliability & Operations",
        "discipline": "Messaging Infrastructure · Cloud Architecture",
        "technologies": [
            "EMQX",
            "MQTT",
            "WebSocket Secure",
            "TLS",
            "Kubernetes",
            "GKE",
            "VM"
        ],
        "status": "Architecture evaluation & troubleshooting",
        "statusDetail": "WSS deployment and migration not confirmed",
        "summary": "An assessment of secure browser MQTT connectivity, EMQX hosting trade-offs, and Kubernetes startup dependencies.",
        "contentFile": "content/work/mqtt-wss-architecture-assessment.md",
        "contentFileZh": "content/work/zh-Hant/mqtt-wss-architecture-assessment.zh-Hant.md"
    }
];
