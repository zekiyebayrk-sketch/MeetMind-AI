function items(meetingId, entries) {
  return entries.map((entry, index) => ({ id: `${meetingId}-item-${index + 1}`, ...entry }))
}

export const analysisContent = {
  'product-strategy-sync': {
    summary:
      "The team reviewed progress on the onboarding redesign and aligned on next steps for user testing. Jamie confirmed the first prototype is ready, with testing set to begin Tuesday and wrap up by Friday. Sam will coordinate a design review before testing kicks off, and the group agreed to revisit Q3 roadmap priorities once results are in.",
    actionItems: items('product-strategy-sync', [
      { text: 'Share the onboarding prototype with the design team', owner: 'Sam Kim', dueDate: '2026-07-30' },
      { text: 'Kick off user testing for the onboarding redesign', owner: 'Jamie Moore', dueDate: '2026-08-04' },
      { text: 'Compile testing results into a summary report', owner: 'Jamie Moore', dueDate: '2026-08-07' },
      { text: 'Draft Q3 roadmap options for review', owner: 'Alex Lin', dueDate: '2026-08-10' },
      { text: 'Schedule the design review before testing begins', owner: 'Sam Kim', dueDate: '2026-07-31' },
      { text: 'Confirm the onboarding metrics dashboard is ready', owner: 'Alex Lin', dueDate: '2026-08-03' },
    ]),
    keyDecisions: [
      'User testing for the onboarding redesign will run Tuesday through Friday.',
      'The design team will review the prototype before testing starts.',
      'Q3 roadmap prioritization will be revisited after onboarding results are in.',
    ],
    nextMeeting: {
      date: 'Tue, Aug 4, 2026 · 10:00 AM',
      agenda: [
        'Review onboarding user testing results',
        'Finalize Q3 roadmap priorities',
        'Confirm design review outcomes',
      ],
    },
    overview: { sentiment: 'Positive', engagementScore: 8.7, talkTimeBalance: 'Balanced across 5 speakers' },
  },
  'design-critique': {
    summary:
      "Riya walked through the latest dashboard redesign, highlighting improved information density and a simplified navigation pattern. Theo raised concerns about contrast on the new chart colors, and the team agreed to run a quick accessibility pass before the next review. Overall feedback was positive, with minor polish items flagged for the empty and loading states.",
    actionItems: items('design-critique', [
      { text: 'Update chart color palette for AA contrast compliance', owner: 'Theo Lange', dueDate: '2026-07-30' },
      { text: 'Design empty-state illustration for the dashboard', owner: 'Riya Mehta', dueDate: '2026-08-01' },
      { text: 'Add loading skeletons to the redesigned widgets', owner: 'Riya Mehta', dueDate: '2026-07-31' },
      { text: 'Share updated Figma file with the wider team', owner: 'Theo Lange', dueDate: '2026-07-29' },
      { text: 'Run an accessibility pass on the new navigation', owner: 'Riya Mehta', dueDate: '2026-08-03' },
    ]),
    keyDecisions: [
      'Navigation redesign is approved to move into development.',
      'Chart colors will be revised before the next design review.',
    ],
    nextMeeting: {
      date: 'Mon, Aug 3, 2026 · 2:00 PM',
      agenda: [
        'Review updated chart palette',
        'Walk through empty and loading states',
        'Sign off on navigation redesign',
      ],
    },
    overview: { sentiment: 'Positive', engagementScore: 8.2, talkTimeBalance: 'Balanced across 4 speakers' },
  },
  'weekly-marketing-review': {
    summary:
      "Chloe shared early results from the summer campaign, noting a strong lift in email open rates but softer click-through on paid social. Nina proposed testing new ad creative next week to address the drop-off. The team agreed to hold budget steady while testing runs and revisit spend allocation at the next review.",
    actionItems: items('weekly-marketing-review', [
      { text: 'Launch new ad creative variants for paid social', owner: 'Nina Park', dueDate: '2026-07-29' },
      { text: 'Pull full campaign performance report', owner: 'Chloe Banks', dueDate: '2026-07-28' },
      { text: 'Draft copy options for the fall newsletter', owner: 'Chloe Banks', dueDate: '2026-08-01' },
      { text: 'Review budget allocation once creative test concludes', owner: 'Nina Park', dueDate: '2026-08-05' },
    ]),
    keyDecisions: [
      'Marketing budget stays flat while the creative test runs.',
      'New ad creative will launch next week to address paid social click-through.',
    ],
    nextMeeting: {
      date: 'Fri, Jul 31, 2026 · 11:00 AM',
      agenda: [
        'Review new ad creative performance',
        'Finalize fall newsletter copy',
        'Revisit budget allocation',
      ],
    },
    overview: { sentiment: 'Neutral', engagementScore: 7.4, talkTimeBalance: 'Balanced across 4 speakers' },
  },
  'sprint-planning': {
    summary:
      "The engineering team scoped work for the upcoming sprint, prioritizing the payments retry logic and the mobile onboarding bug fixes. Dana flagged a dependency on the design team for the new empty states, and Marcus volunteered to unblock the CI pipeline issues reported last week. The team committed to a slightly lighter sprint to account for the upcoming on-call rotation.",
    actionItems: items('sprint-planning', [
      { text: 'Fix payments retry logic for failed transactions', owner: 'Dana Kwon', dueDate: '2026-07-25' },
      { text: 'Resolve mobile onboarding crash on older devices', owner: 'Priya Shah', dueDate: '2026-07-26' },
      { text: 'Unblock CI pipeline flakiness', owner: 'Marcus Gray', dueDate: '2026-07-24' },
      { text: 'Confirm empty-state designs with the design team', owner: 'Dana Kwon', dueDate: '2026-07-27' },
      { text: 'Update sprint board with revised estimates', owner: 'Marcus Gray', dueDate: '2026-07-23' },
    ]),
    keyDecisions: [
      'Sprint scope is reduced to accommodate the on-call rotation.',
      'Payments retry logic is the top priority for the sprint.',
      'CI pipeline fixes are assigned before any new feature work begins.',
    ],
    nextMeeting: {
      date: 'Wed, Aug 5, 2026 · 9:30 AM',
      agenda: ['Sprint progress check-in', 'Review CI pipeline fixes', 'Confirm empty-state designs are in'],
    },
    overview: { sentiment: 'Positive', engagementScore: 8.0, talkTimeBalance: 'Balanced across 7 speakers' },
  },
  'customer-success-check-in': {
    summary:
      "Ethan shared that renewal conversations with two key accounts are progressing well, though one account raised concerns about onboarding time. Hana suggested a lightweight onboarding checklist to speed up time-to-value for new customers. The team agreed to pilot the checklist with the next two onboarding cohorts.",
    actionItems: items('customer-success-check-in', [
      { text: 'Draft a lightweight onboarding checklist', owner: 'Hana Tran', dueDate: '2026-07-25' },
      { text: 'Follow up with the account concerned about onboarding time', owner: 'Ethan Wood', dueDate: '2026-07-23' },
      { text: 'Pilot the checklist with the next onboarding cohort', owner: 'Hana Tran', dueDate: '2026-08-01' },
    ]),
    keyDecisions: ['A lightweight onboarding checklist will be piloted with new customers.'],
    nextMeeting: {
      date: 'Tue, Jul 28, 2026 · 3:00 PM',
      agenda: ['Review onboarding checklist pilot', 'Renewal status update'],
    },
    overview: { sentiment: 'Positive', engagementScore: 7.9, talkTimeBalance: 'Balanced across 3 speakers' },
  },
  'q3-budget-review': {
    summary:
      "Jordan presented the Q3 budget draft, flagging that marketing spend is trending above forecast while engineering headcount costs are under budget. Leah proposed reallocating part of the engineering surplus toward the marketing overage rather than cutting campaigns mid-quarter. The team agreed to finalize the revised budget by the end of the month.",
    actionItems: items('q3-budget-review', [
      { text: 'Prepare revised Q3 budget with reallocated engineering surplus', owner: 'Leah Ross', dueDate: '2026-07-24' },
      { text: 'Get sign-off from department heads on the revised numbers', owner: 'Jordan Blake', dueDate: '2026-07-28' },
      { text: 'Update the forecast model with actuals through July', owner: 'Leah Ross', dueDate: '2026-07-22' },
      { text: 'Circulate the final Q3 budget for approval', owner: 'Jordan Blake', dueDate: '2026-07-31' },
    ]),
    keyDecisions: [
      'Engineering budget surplus will be reallocated to cover marketing overage.',
      'Final Q3 budget will be circulated for approval by end of month.',
    ],
    nextMeeting: {
      date: 'Fri, Jul 31, 2026 · 1:00 PM',
      agenda: ['Review sign-offs from department heads', 'Approve final Q3 budget'],
    },
    overview: { sentiment: 'Neutral', engagementScore: 7.6, talkTimeBalance: 'Balanced across 5 speakers' },
  },
  'engineering-retro': {
    summary:
      "The team reflected on the previous sprint, noting that the new code review checklist reduced review turnaround time significantly. The main friction point raised was flaky end-to-end tests slowing down deploys. The team agreed to dedicate time next sprint to stabilize the test suite.",
    actionItems: items('engineering-retro', [
      { text: 'Audit and stabilize flaky end-to-end tests', owner: 'Marcus Gray', dueDate: '2026-07-22' },
      { text: 'Document the new code review checklist in the wiki', owner: 'Dana Kwon', dueDate: '2026-07-18' },
    ]),
    keyDecisions: ['Test suite stabilization is prioritized for the next sprint.'],
    nextMeeting: {
      date: 'Wed, Jul 29, 2026 · 4:00 PM',
      agenda: ['Check progress on test suite stabilization'],
    },
    overview: { sentiment: 'Positive', engagementScore: 8.4, talkTimeBalance: 'Balanced across 6 speakers' },
  },
  'sales-pipeline-review': {
    summary:
      "Omar walked through the pipeline, noting strong momentum in the enterprise segment but slower movement on mid-market deals. Fiona proposed tightening qualification criteria to focus effort on higher-probability opportunities. The team agreed to revisit mid-market messaging before the next review.",
    actionItems: items('sales-pipeline-review', [
      { text: 'Tighten mid-market qualification criteria', owner: 'Fiona Shaw', dueDate: '2026-07-16' },
      { text: 'Update enterprise deal forecasts for the quarter', owner: 'Omar Tate', dueDate: '2026-07-15' },
      { text: 'Revise mid-market outreach messaging', owner: 'Fiona Shaw', dueDate: '2026-07-18' },
      { text: 'Schedule check-ins with stalled mid-market accounts', owner: 'Omar Tate', dueDate: '2026-07-17' },
    ]),
    keyDecisions: [
      'Qualification criteria for mid-market deals will be tightened.',
      'Mid-market messaging will be revised before the next pipeline review.',
    ],
    nextMeeting: {
      date: 'Fri, Jul 18, 2026 · 10:00 AM',
      agenda: ['Review revised mid-market messaging', 'Enterprise forecast update'],
    },
    overview: { sentiment: 'Mixed', engagementScore: 7.1, talkTimeBalance: 'Balanced across 4 speakers' },
  },
  'leadership-offsite-recap': {
    summary:
      "Leadership reviewed the outcomes of the two-day offsite, aligning on three company-wide priorities for the second half of the year: improving onboarding time-to-value, strengthening the mid-market sales motion, and investing in platform reliability. Zoe emphasized the need for clearer cross-team communication on these priorities, and the group agreed to share a summary with the wider company.",
    actionItems: items('leadership-offsite-recap', [
      { text: 'Draft a company-wide summary of offsite priorities', owner: 'Zoe Bennett', dueDate: '2026-07-13' },
      { text: 'Align department roadmaps with the three H2 priorities', owner: 'Kai Ho', dueDate: '2026-07-22' },
      { text: 'Schedule a company all-hands to share the offsite outcomes', owner: 'Will Park', dueDate: '2026-07-15' },
      { text: 'Set up quarterly check-ins to track priority progress', owner: 'Zoe Bennett', dueDate: '2026-07-20' },
    ]),
    keyDecisions: [
      'Improving onboarding time-to-value is a top H2 priority.',
      'Strengthening the mid-market sales motion is a top H2 priority.',
      'Investing in platform reliability is a top H2 priority.',
      'Quarterly check-ins will track progress against these priorities.',
    ],
    nextMeeting: {
      date: 'Wed, Oct 7, 2026 · 9:00 AM',
      agenda: ['Q3 progress check-in against H2 priorities'],
    },
    overview: { sentiment: 'Positive', engagementScore: 8.9, talkTimeBalance: 'Balanced across 8 speakers' },
  },
  'onboarding-process-review': {
    summary:
      "Yara reviewed feedback from recent new-hire surveys, noting that new employees want more structured first-week guidance. Quinn proposed a revised onboarding buddy program to pair new hires with a peer mentor. The team agreed to pilot the updated program with the next new-hire cohort.",
    actionItems: items('onboarding-process-review', [
      { text: 'Design a structured first-week onboarding guide', owner: 'Yara Nasser', dueDate: '2026-07-11' },
      { text: 'Launch the revised onboarding buddy program', owner: 'Quinn Cole', dueDate: '2026-07-18' },
      { text: 'Collect feedback from the next new-hire cohort', owner: 'Yara Nasser', dueDate: '2026-08-01' },
    ]),
    keyDecisions: ['The onboarding buddy program will be revised and piloted.'],
    nextMeeting: {
      date: 'Fri, Jul 11, 2026 · 2:00 PM',
      agenda: ['Review first-week onboarding guide draft'],
    },
    overview: { sentiment: 'Positive', engagementScore: 7.8, talkTimeBalance: 'Balanced across 3 speakers' },
  },
}

export const defaultAnalysisId = 'product-strategy-sync'
