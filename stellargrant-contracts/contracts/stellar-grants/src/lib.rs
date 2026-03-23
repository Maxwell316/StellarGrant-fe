#![no_std]
mod events;
mod storage;
mod types;

use soroban_sdk::{contract, contractimpl, Address, Env};
pub use storage::Storage;
pub use types::{ContractError, Grant, Milestone, MilestoneState};

#[contract]
pub struct StellarGrantsContract;

#[contractimpl]
impl StellarGrantsContract {
    /// Initialize the contract
    pub fn initialize(_env: Env) -> Result<(), ContractError> {
        // Contract initialization logic
        Ok(())
    }

    /// Allows authorized reviewers to vote on submitted milestones.
    /// Tracks votes and calculates quorum for approval.
    ///
    /// # Arguments
    /// * `env` - The Soroban environment
    /// * `grant_id` - The ID of the grant
    /// * `milestone_idx` - The index of the milestone to vote on
    /// * `reviewer` - The address of the reviewer
    /// * `approve` - True to approve, false to reject
    ///
    /// # Returns
    /// `true` if quorum is reached, `false` otherwise
    ///
    /// # Errors
    /// * `GrantNotFound` - If the grant doesn't exist
    /// * `MilestoneNotSubmitted` - If the milestone is not in Submitted state
    /// * `Unauthorized` - If the reviewer is not authorized
    /// * `AlreadyVoted` - If the reviewer has already voted
    pub fn milestone_vote(
        env: Env,
        grant_id: u64,
        milestone_idx: u32,
        reviewer: Address,
        approve: bool,
    ) -> Result<bool, ContractError> {
        reviewer.require_auth();

        // 1. Validation
        let grant = Storage::get_grant(&env, grant_id).ok_or(ContractError::GrantNotFound)?;
        let mut milestone = Storage::get_milestone(&env, grant_id, milestone_idx)
            .ok_or(ContractError::MilestoneNotSubmitted)?;

        if milestone.state != MilestoneState::Submitted {
            return Err(ContractError::MilestoneNotSubmitted);
        }

        // Check if reviewer is in grant's reviewer list
        if !grant.reviewers.contains(reviewer.clone()) {
            return Err(ContractError::Unauthorized);
        }

        // Check if reviewer has already voted
        if milestone.votes.contains_key(reviewer.clone()) {
            return Err(ContractError::AlreadyVoted);
        }

        // 2. Vote Tracking
        milestone.votes.set(reviewer.clone(), approve);
        if approve {
            milestone.approvals += 1;
        } else {
            milestone.rejections += 1;
        }

        // 3. Quorum Calculation
        let total_reviewers = grant.reviewers.len();
        let quorum_threshold = (total_reviewers / 2) + 1;
        let quorum_reached = milestone.approvals >= quorum_threshold;

        if quorum_reached {
            milestone.state = MilestoneState::Approved;
        }

        // 4. Persistence
        Storage::set_milestone(&env, grant_id, milestone_idx, &milestone);

        // 5. Events
        events::milestone_voted(&env, grant_id, milestone_idx, reviewer, approve);

        Ok(quorum_reached)
    }
}

#[cfg(test)]
mod test;
