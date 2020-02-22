package com.hengyi.japp.mes.auto.doffing.application;

import com.github.ixtf.persistence.mongo.Jmongo;
import com.google.inject.Inject;
import com.hengyi.japp.mes.auto.domain.Workshop;
import com.hengyi.japp.mes.auto.proto.*;
import com.mongodb.reactivestreams.client.MongoCollection;
import io.netty.buffer.ByteBuf;
import io.rsocket.metadata.CompositeMetadata;
import org.bson.Document;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

/**
 * @author jzb 2020-02-21
 */
public class DoffingServiceImpl implements DoffingService {
    private final Jmongo jmongo;

    @Inject
    private DoffingServiceImpl(Jmongo jmongo) {
        this.jmongo = jmongo;
    }

    @Override
    public Mono<ListCheckSilkResponse> autoListCheckSilkByWorkshop(ListCheckByWorkshopRequest message, ByteBuf metadata) {
        final MongoCollection<Document> T_Workshop = jmongo.collection(Workshop.class);
        final Mono<Workshop> workshopMono = jmongo.find(Workshop.class, message.getWorkshop().getId());
//        final CheckSilkDTO dto = CheckSilkDTO.newBuilder().setSideType().build();
//        ListCheckSilkResponse.newBuilder().addDtos(dto);

        final Map<String, Object> metadataMap = new HashMap<>();
        final CompositeMetadata compositeMetadata = new CompositeMetadata(metadata, true);
        compositeMetadata.forEach(entry -> {
            byte[] bytes = new byte[entry.getContent().readableBytes()];
            entry.getContent().readBytes(bytes);
            metadataMap.put(entry.getMimeType(), new String(bytes, StandardCharsets.UTF_8));
        });
        return null;
    }

    @Override
    public Mono<ListCheckSilkResponse> manualListCheckSilkByWorkshop(ListCheckByWorkshopRequest message, ByteBuf metadata) {
        return null;
    }

    @Override
    public Mono<ListDoffingSpecResponse> listDoffingSpecByWorkshop(EntityDTO message, ByteBuf metadata) {
        return null;
    }

    @Override
    public Mono<ListCheckSilkResponse> autoListCheckSilkByLine(ListCheckSilkByLineRequest message, ByteBuf metadata) {
        return null;
    }

    @Override
    public Mono<ListCheckSilkResponse> manualListCheckSilkByLine(ListCheckSilkByLineRequest message, ByteBuf metadata) {
        return null;
    }

    @Override
    public Mono<ListDoffingSpecResponse> listDoffingSpecByLine(EntityDTO message, ByteBuf metadata) {
        return null;
    }
}
