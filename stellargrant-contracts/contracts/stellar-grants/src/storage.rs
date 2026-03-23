use crate::types::{Grant, Milestone};
use soroban_sdk::{contracttype, Env};

#[contracttype]
pub enum DataKey {
    Grant(u64),
    Milestone(u64, u32),
    GrantCounter,
}

pub struct Storage;

impl Storage {
    pub fn get_grant(env: &Env, grant_id: u64) -> Option<Grant> {
        env.storage().persistent().get(&DataKey::Grant(grant_id))
    }

    pub fn set_grant(env: &Env, grant_id: u64, grant: &Grant) {
        env.storage()
            .persistent()
            .set(&DataKey::Grant(grant_id), grant);
    }

    pub fn get_milestone(env: &Env, grant_id: u64, milestone_idx: u32) -> Option<Milestone> {
        env.storage()
            .persistent()
            .get(&DataKey::Milestone(grant_id, milestone_idx))
    }

    pub fn set_milestone(env: &Env, grant_id: u64, milestone_idx: u32, milestone: &Milestone) {
        env.storage()
            .persistent()
            .set(&DataKey::Milestone(grant_id, milestone_idx), milestone);
    }

    pub fn has_grant(env: &Env, grant_id: u64) -> bool {
        env.storage().persistent().has(&DataKey::Grant(grant_id))
    }
}
