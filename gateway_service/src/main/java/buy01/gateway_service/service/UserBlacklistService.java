package buy01.gateway_service.service;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserBlacklistService {

    private final StringRedisTemplate redisTemplate;

    public boolean isBlacklisted(String userId) {
        return Boolean.TRUE.equals(redisTemplate.hasKey(userId));
    }
}
