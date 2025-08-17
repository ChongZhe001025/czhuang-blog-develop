<!-- Comment:
A great PR typically begins with the line below.
Replace XXXXX with the numeric part of the issue ID you created in Jira.
Note that if you want your changes backported into LTS, you need to create a Jira issue. See https://www.jenkins.io/download/lts/#backporting-process for more information.
-->

See [JENKINS-62419](https://issues.jenkins.io/browse/JENKINS-62419).

<!-- Comment:
If the issue is not fully described in Jira, add more information here (justification, pull request links, etc.).

 * We do not require Jira issues for minor improvements.
 * Bug fixes should have a Jira issue to facilitate the backporting process.
 * Major new features should have a Jira issue.
-->

### Summary
This PR adds an indication of the language of the page in the footer. This enhancement improves accessibility and user experience by explicitly showing the language of the displayed content.

### Justification
Even if some localizations are missing, showing a baseline language is useful for users. The locale field should be determined from the response page so that plugins like Locale Plugin are handled correctly. Reference to the Locale Plugin filter:  
[LocaleFilter.java](https://github.com/jenkinsci/locale-plugin/blob/master/src/main/java/hudson/plugins/locale/LocaleFilter.java)

### Testing done
- Implemented changes in Jenkins Core.
- Verified that the Request object returns the correct Locale information when using the Locale Plugin.
- Screenshots attached:

	#### before：
	![screenshot-before](https://github.com/user-attachments/assets/5a314e00-3211-4931-a394-f18a7710d7a0)
	#### after：
	![screenshot-en](https://github.com/user-attachments/assets/fbfbbb8f-7780-40da-ae6c-9f5d002cf78c)
	![screenshot-ru](https://github.com/user-attachments/assets/068029e1-6cc1-4ae8-97a9-5ed9c505b541)
	![screenshot-tr](https://github.com/user-attachments/assets/a80d268c-1190-400b-933c-53d960e50c0b)

### Proposed changelog entries
- Indicate the language of the page in the footer to improve accessibility and user experience.

### Proposed changelog category
/label localization

### Proposed upgrade guidelines
N/A

### Submitter checklist
- [X] The Jira issue, if it exists, is well-described.
- [X] The changelog entries and upgrade guidelines are appropriate.
- [X] There is automated testing or an explanation for the lack of tests.
- [X] New public classes, fields, and methods are annotated appropriately.
- [X] For dependency updates, external changelogs and full differentials are linked.
- [X] For new APIs, there is a link to at least one consumer.

### Desired reviewers
@mention

<!-- Comment:
If you need an accelerated review process by the community (e.g., for critical bugs), mention @jenkinsci/core-pr-reviewers.
-->

Before the changes are marked as `ready-for-merge`:

### Maintainer checklist

- [ ] There are at least two (2) approvals for the pull request and no outstanding requests for change.
- [ ] Conversations in the pull request are over, or it is explicit that a reviewer is not blocking the change.
- [ ] Changelog entries in the pull request title and/or **Proposed changelog entries** are accurate, human-readable, and in the imperative mood.
- [ ] Proper changelog labels are set so that the changelog can be generated automatically.
- [ ] If the change needs additional upgrade steps from users, the `upgrade-guide-needed` label is set and there is a **Proposed upgrade guidelines** section in the pull request title (see [example](https://github.com/jenkinsci/jenkins/pull/4387)).
- [ ] If it would make sense to backport the change to LTS, a Jira issue must exist, be a _Bug_ or _Improvement_, and be labeled as `lts-candidate` to be considered (see [query](https://issues.jenkins.io/issues/?filter=12146)).
