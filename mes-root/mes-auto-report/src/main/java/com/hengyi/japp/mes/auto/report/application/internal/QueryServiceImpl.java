package com.hengyi.japp.mes.auto.report.application.internal;

import com.fasterxml.jackson.databind.type.CollectionLikeType;
import com.github.ixtf.japp.core.J;
import com.google.common.collect.Maps;
import com.google.inject.Inject;
import com.google.inject.Singleton;
import com.hengyi.japp.mes.auto.application.PackageBoxQuery;
import com.hengyi.japp.mes.auto.application.SilkCarRecordQuery;
import com.hengyi.japp.mes.auto.application.SilkCarRecordQueryByEventSourceCanHappen;
import com.hengyi.japp.mes.auto.report.application.QueryService;
import lombok.Data;
import lombok.SneakyThrows;
import org.apache.commons.lang3.tuple.Pair;

import java.io.IOException;
import java.io.Serializable;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpRequest.BodyPublishers;
import java.net.http.HttpResponse;
import java.net.http.HttpResponse.BodyHandlers;
import java.time.LocalDate;
import java.util.*;

import static com.github.ixtf.japp.core.Constant.MAPPER;

/**
 * @author jzb 2019-05-20
 */
@Singleton
public class QueryServiceImpl implements QueryService {
    private static final HttpClient httpClient = HttpClient.newBuilder().version(HttpClient.Version.HTTP_1_1).build();
    private final String searchBaseUrl;

    @Inject
    private QueryServiceImpl(String searchBaseUrl) {
        this.searchBaseUrl = searchBaseUrl;
    }

    @Override
    public Collection<String> querySilkCarRecordIds(String workshopId, long startL, long endL) {
        final Map<Object, Object> map = Maps.newHashMap();
        final SilkCarRecordQuery query = SilkCarRecordQuery.builder()
                .pageSize(Integer.MAX_VALUE)
                .workshopId(workshopId)
                .startDateTime(new Date(startL))
                .endDateTime(new Date(endL))
                .build();
        return query(query).getRight();
    }

    @Override
    public Collection<String> querySilkCarRecordIdsByEventSourceCanHappen(String workshopId, long startL, long endL) {
        final SilkCarRecordQueryByEventSourceCanHappen query = SilkCarRecordQueryByEventSourceCanHappen.builder()
                .workshopId(workshopId)
                .startDateTime(new Date(startL))
                .endDateTime(new Date(endL))
                .build();
        return query(query);
    }

    @Override
    public Collection<String> queryPackageBoxIds(String workshopId, LocalDate startBudat, LocalDate endBudat) {
        final PackageBoxQuery query = PackageBoxQuery.builder().pageSize(Integer.MAX_VALUE)
                .workshopId(workshopId)
                .startBudat(startBudat)
                .endBudat(endBudat.plusDays(1))
                .build();
        return query(query).getRight();
    }

    @Override
    public Collection<String> queryPackageBoxIds(String workshopId, long startDateTime, long endDateTime) {
        return Collections.EMPTY_LIST;
    }

    @Override
    public String url(String url) {
        return searchBaseUrl + "/search/" + url;
    }

    @SneakyThrows({IOException.class, InterruptedException.class})
    @Override
    public Pair<Long, Collection<String>> query(String uri, Object query) {
        final byte[] bytes = MAPPER.writeValueAsBytes(query);
        final HttpRequest httpRequest = HttpRequest.newBuilder()
                .uri(URI.create(uri))
                .POST(BodyPublishers.ofByteArray(bytes))
                .build();
        final HttpResponse<byte[]> response = httpClient.send(httpRequest, BodyHandlers.ofByteArray());
        final int statusCode = response.statusCode();
        if (statusCode < 200 || statusCode >= 300) {
            throw new RuntimeException();
        }
        return MAPPER.readValue(response.body(), QueryResult.class).pair();
    }

    @SneakyThrows({IOException.class, InterruptedException.class})
    @Override
    public Collection<String> query(SilkCarRecordQueryByEventSourceCanHappen query) {
        final byte[] bytes = MAPPER.writeValueAsBytes(query);
        final HttpRequest httpRequest = HttpRequest.newBuilder()
                .uri(URI.create(url("silkCarRecordsByEventSourceCanHappen")))
                .POST(BodyPublishers.ofByteArray(bytes))
                .build();
        final HttpResponse<byte[]> response = httpClient.send(httpRequest, BodyHandlers.ofByteArray());
        final int statusCode = response.statusCode();
        if (statusCode < 200 || statusCode >= 300) {
            throw new RuntimeException();
        }
        final CollectionLikeType collectionLikeType = MAPPER.getTypeFactory().constructCollectionLikeType(ArrayList.class, String.class);
        return MAPPER.readValue(response.body(), collectionLikeType);
    }

    @Data
    public static class QueryResult implements Serializable {
        private long count;
        private Collection<String> ids;

        public Pair<Long, Collection<String>> pair() {
            return Pair.of(count, J.emptyIfNull(ids));
        }
    }
}
