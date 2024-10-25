Officers
    OfficerId
    Name
    Email
    Password
    Role
    AccessLevel
    AccessCode
    IsEmailValid

Services
    ServiceId
    ServiceName
    NameShort
    CreatedAt
    Active

ServiceForm
    FromId
    ServiceId
    GeneralForm
    PresentAddressForm
    PermanentAddressFrom
    BankForm
    DocumentForm
    Amount
    FormUpdationColumn ("Column Of Form To be updated by officer")
    LetterUpdationDetails ("Details which should only be changed in the sanction letter")


WorkFlow
    WorkFlowId
    ServiceId
    Role
    SequenceOrder
    CanForward
    CanReturn
    CanReturnToEdit
    CanUpdate
    CanSanction
    CanReject

ApplicationHistory
    HistoryId
    ServiceId
    ApplicationId
    ActionTaken
    TakenBy (OfficerId)
    File
    TakenAt

ApplicationStatus
    StatusId
    ServiceId    
    ApplicationId
    Status (Pending,PendingWithCitizen,Rejected,Returned,Sanctioned)
    CurrentlyWith (OfficerId)
    File
    DateTime

ApplicationsCount
    CountId
    ServiceId
    OfficerId
    Status (Pending,PendingWithCitizen,Rejected,Returned,Sanctioned)
    Count
    LastUpdated

