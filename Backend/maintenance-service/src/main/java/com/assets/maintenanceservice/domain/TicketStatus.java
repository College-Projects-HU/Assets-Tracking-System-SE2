package com.assets.maintenanceservice.domain;

import java.util.EnumSet;
import java.util.Map;
import java.util.Set;

public enum TicketStatus {
    OPEN, IN_PROGRESS, RESOLVED, CLOSED;

    private static final Map<TicketStatus, Set<TicketStatus>> ALLOWED = Map.of(
            OPEN, EnumSet.of(IN_PROGRESS),
            IN_PROGRESS, EnumSet.of(RESOLVED),
            RESOLVED, EnumSet.of(CLOSED),
            CLOSED, EnumSet.noneOf(TicketStatus.class)
    );

    public boolean canTransitionTo(TicketStatus target) {
        return ALLOWED.getOrDefault(this, EnumSet.noneOf(TicketStatus.class)).contains(target);
    }
}
