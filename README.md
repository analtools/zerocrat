# zerocrat

**zerocrat** is a project for analyzing development and task management processes across GitLab, GitHub, Confluence and Jira. It helps teams gain insights into workflows, task progress, and employee activity by aggregating and correlating data from multiple systems.

## Features

- Integration with **GitLab**, **GitHub**, **Confluence** and **Jira**
- Collection and normalization of development activity data
- Mapping and synchronization of tasks and statuses between Jira and Git repositories
- Analysis of Jira task descriptions and metadata
- Calculation of employee activity and productivity metrics
- Generation of analytical reports with tables and charts
- Automatic generation of recommendations for employees based on activity and metrics analysis

## Use Cases

- Engineering and delivery analytics  
- Tracking task progress across tools  
- Process transparency for team leads and managers  
- Data-driven insights for improving development workflows  
- Personalized feedback and recommendations for employees  

## Architecture (High Level)

- Data collectors for GitLab, GitHub, Confluence and Jira APIs  
- Processing and correlation layer for tasks, statuses, and users  
- Metrics and analytics module  
- Recommendation engine  
- Reporting layer for visualizations and tabular outputs  

## Getting Started

1. Clone the repository:

```bash
git clone https://github.com/analtools/zerocrat.git
cd zerocrat
```

2. Configure access to GitLab, GitHub, Confluence and Jira (API tokens, URLs).
3. Run data collection and analysis modules according to your setup.

> Detailed setup and configuration instructions are provided in the project documentation.

## Requirements

* Access to GitLab, GitHub, Confluence and Jira APIs
* Appropriate permissions to read repositories, issues, and tasks

## Project Status

The project is under active development and may change as new metrics, integrations, reports, and recommendation models are added.

## License

[MIT License](https://github.com/analtools/zerocrat/blob/main/LICENSE)
