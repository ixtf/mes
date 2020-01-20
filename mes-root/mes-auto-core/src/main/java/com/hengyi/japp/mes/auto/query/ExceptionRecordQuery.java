package com.hengyi.japp.mes.auto.query;

import com.hengyi.japp.mes.auto.domain.ExceptionRecord;
import lombok.Builder;
import lombok.Getter;

import java.util.Collection;
import java.util.Set;

/**
 * @author jzb 2018-07-01
 */
@Builder
public class ExceptionRecordQuery {
    @Getter
    @Builder.Default
    private final int first = 0;
    @Getter
    @Builder.Default
    private final int pageSize = 50;
    @Getter
    private final boolean handled;
    @Getter
    private final Set<String> lineMachineIds;

    @Builder
    public static class Result {
        @Getter
        private final int first;
        @Getter
        private final int pageSize;
        @Getter
        private final long count;
        @Getter
        private final Collection<ExceptionRecord> result;
    }

}
