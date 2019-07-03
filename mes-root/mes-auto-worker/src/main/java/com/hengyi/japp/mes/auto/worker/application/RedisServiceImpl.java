package com.hengyi.japp.mes.auto.worker.application;

import com.github.ixtf.japp.core.J;
import com.google.inject.Inject;
import com.google.inject.Singleton;
import com.hengyi.japp.mes.auto.application.DyeingService;
import com.hengyi.japp.mes.auto.application.RedisService;
import com.hengyi.japp.mes.auto.domain.DyeingResult;
import com.hengyi.japp.mes.auto.domain.LineMachine;
import com.hengyi.japp.mes.auto.repository.DyeingResultRepository;
import lombok.extern.slf4j.Slf4j;
import redis.clients.jedis.Jedis;
import redis.clients.jedis.JedisPool;

import java.util.Optional;

/**
 * @author jzb 2019-03-01
 */
@Slf4j
@Singleton
public class RedisServiceImpl implements RedisService {
    private final JedisPool jedisPool;
    private final DyeingResultRepository dyeingResultRepository;

    @Inject
    private RedisServiceImpl(JedisPool jedisPool, DyeingResultRepository dyeingResultRepository) {
        this.jedisPool = jedisPool;
        this.dyeingResultRepository = dyeingResultRepository;
    }

    @Override
    public Optional<DyeingResult> latestDyeingResult_FIRST(LineMachine lineMachine, int spindle) {
        final String key = DyeingService.firstDyeingKey(lineMachine, spindle);
        return latestDyeingResult(key);
    }

    private Optional<DyeingResult> latestDyeingResult(String key) {
        try (final Jedis jedis = jedisPool.getResource()) {
            return Optional.ofNullable(jedis.hgetAll(key))
                    .map(it -> it.get("id"))
                    .filter(J::nonBlank)
                    .flatMap(dyeingResultRepository::find);
        }
    }

    @Override
    public Optional<DyeingResult> latestDyeingResult_CROSS(LineMachine lineMachine, int spindle) {
        final String key = DyeingService.crossDyeingKey(lineMachine, spindle);
        return latestDyeingResult(key);
    }
}
