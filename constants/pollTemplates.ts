// Poll templates for quick poll creation

export interface PollTemplate {
    name: string;
    icon: string;
    category: string;
    question: string;
    description: string;
    options: string[];
    suggestedDuration: number; // in minutes
    tokenGatingEnabled?: boolean;
    tokenAddress?: string;
    minimumTokenBalance?: string;
}

export const POLL_TEMPLATES: PollTemplate[] = [
    {
        name: "Yes/No Vote",
        icon: "✓",
        category: "Governance",
        question: "",
        description: "A simple binary decision requiring community approval",
        options: ["Yes", "No"],
        suggestedDuration: 10080 // 7 days
    },
    {
        name: "Multiple Choice",
        icon: "☰",
        category: "Governance",
        question: "",
        description: "Select from multiple predefined options",
        options: ["Option A", "Option B", "Option C", "Option D"],
        suggestedDuration: 10080 // 7 days
    },
    {
        name: "Budget Allocation",
        icon: "💰",
        category: "Finance",
        question: "How should we allocate the treasury funds?",
        description: "Vote to determine the distribution of available treasury resources across different initiatives",
        options: ["Development (40%)", "Marketing (30%)", "Operations (20%)", "Reserve (10%)"],
        suggestedDuration: 10080 // 7 days
    },
    {
        name: "Feature Priority",
        icon: "⭐",
        category: "Technology",
        question: "Which feature should we prioritize next?",
        description: "Help us decide which development initiative should receive priority in the next sprint",
        options: ["Mobile App", "API Integration", "Security Audit", "Performance Optimization"],
        suggestedDuration: 1440 // 1 day
    },
    {
        name: "Team Member",
        icon: "👥",
        category: "Governance",
        question: "Should we approve this new team member?",
        description: "Vote to approve or reject the proposed addition to the core team",
        options: ["Approve", "Reject", "Need More Information"],
        suggestedDuration: 1440 // 1 day
    },
    {
        name: "Proposal Approval",
        icon: "📜",
        category: "Governance",
        question: "Do you approve this governance proposal?",
        description: "Formal vote on the submitted governance proposal as outlined in the attached documentation",
        options: ["Approve", "Reject", "Revise and Resubmit"],
        suggestedDuration: 10080 // 7 days
    },
    {
        name: "Community Poll",
        icon: "📊",
        category: "Community",
        question: "What is your opinion on this topic?",
        description: "Gather community sentiment on a specific issue or decision point",
        options: ["Strongly Agree", "Agree", "Neutral", "Disagree", "Strongly Disagree"],
        suggestedDuration: 1440 // 1 day
    },
    {
        name: "Partnership Vote",
        icon: "🤝",
        category: "Partnerships",
        question: "Should we proceed with this partnership?",
        description: "Vote to approve or reject the proposed strategic partnership agreement",
        options: ["Approve Partnership", "Reject Partnership", "Request More Details"],
        suggestedDuration: 10080 // 7 days
    },
    {
        name: "Quick Pulse Check",
        icon: "⚡",
        category: "Community",
        question: "",
        description: "Fast feedback collection for time-sensitive decisions",
        options: ["Yes", "No", "Abstain"],
        suggestedDuration: 60 // 1 hour
    },
    {
        name: "Rating Scale",
        icon: "⭐",
        category: "Feedback",
        question: "How would you rate this?",
        description: "Collect feedback using a standard rating scale",
        options: ["Excellent", "Good", "Fair", "Poor"],
        suggestedDuration: 1440 // 1 day
    },
    {
        name: "Grant Approval",
        icon: "🎁",
        category: "Finance",
        question: "Should we approve this grant request?",
        description: "Vote on whether to allocate funds for the proposed grant application",
        options: ["Approve Full Amount", "Approve Partial Amount", "Reject", "Request More Information"],
        suggestedDuration: 10080 // 7 days
    },
    {
        name: "Protocol Upgrade",
        icon: "🔄",
        category: "Technology",
        question: "Should we implement this protocol upgrade?",
        description: "Vote to approve or reject the proposed technical upgrade to the protocol",
        options: ["Approve Upgrade", "Reject Upgrade", "Delay for Further Review"],
        suggestedDuration: 10080 // 7 days
    }
];
