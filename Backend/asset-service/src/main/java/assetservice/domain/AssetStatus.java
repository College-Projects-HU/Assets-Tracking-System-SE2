package com.assets.assetservice.domain;

import java.util.EnumSet;
import java.util.Map;
import java.util.Set;

/** Lifecycle FSM for an Asset. */
public enum AssetStatus {
    AVAILABLE, ASSIGNED, MAINTENANCE, RETIRED;

    private static final Map<AssetStatus, Set<AssetStatus>> ALLOWED = Map.of(
            AVAILABLE,   EnumSet.of(ASSIGNED, MAINTENANCE, RETIRED),
            ASSIGNED,    EnumSet.of(AVAILABLE, MAINTENANCE, RETIRED),
            MAINTENANCE, EnumSet.of(AVAILABLE, RETIRED),
            RETIRED,     EnumSet.noneOf(AssetStatus.class)
    );

    public boolean canTransitionTo(AssetStatus target) {
        return ALLOWED.getOrDefault(this, EnumSet.noneOf(AssetStatus.class)).contains(target);
    }
}
