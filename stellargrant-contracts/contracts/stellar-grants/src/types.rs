use soroban_sdk::Error;

/// Contract error types
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
#[repr(u32)]
pub enum ContractError {
    GrantNotFound = 1,
    Unauthorized = 2,
    MilestoneAlreadyApproved = 3,
    QuorumNotReached = 4,
    DeadlinePassed = 5,
    InvalidInput = 6,
}

impl From<ContractError> for Error {
    fn from(err: ContractError) -> Self {
        Error::from_contract_error(err as u32)
    }
}

impl From<&ContractError> for Error {
    fn from(err: &ContractError) -> Self {
        Error::from_contract_error(*err as u32)
    }
}

impl From<Error> for ContractError {
    fn from(_err: Error) -> Self {
        ContractError::InvalidInput
    }
}
