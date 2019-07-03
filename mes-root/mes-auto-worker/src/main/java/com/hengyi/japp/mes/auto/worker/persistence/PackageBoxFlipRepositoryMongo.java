package com.hengyi.japp.mes.auto.worker.persistence;

import com.github.ixtf.persistence.mongo.Jmongo;
import com.github.ixtf.persistence.mongo.api.MongoUnitOfWork;
import com.google.inject.Inject;
import com.google.inject.Singleton;
import com.hengyi.japp.mes.auto.application.query.PackageBoxFlipQuery;
import com.hengyi.japp.mes.auto.domain.PackageBoxFlip;
import com.hengyi.japp.mes.auto.repository.PackageBoxFlipRepository;
import com.hengyi.japp.mes.auto.search.lucene.PackageBoxFlipLucene;
import com.hengyi.japp.mes.auto.search.lucene.SilkLucene;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.tuple.Pair;
import org.eclipse.microprofile.reactive.streams.operators.ReactiveStreams;

import java.util.concurrent.CompletionStage;
import java.util.stream.Stream;

/**
 * @author jzb 2018-06-24
 */
@Slf4j
@Singleton
public class PackageBoxFlipRepositoryMongo extends MongoEntityRepository<PackageBoxFlip> implements PackageBoxFlipRepository {
    private final PackageBoxFlipLucene packageBoxFlipLucene;
    private final SilkLucene silkLucene;

    @Inject
    private PackageBoxFlipRepositoryMongo(PackageBoxFlipLucene packageBoxFlipLucene, SilkLucene silkLucene) {
        this.packageBoxFlipLucene = packageBoxFlipLucene;
        this.silkLucene = silkLucene;
    }

    @Override
    public PackageBoxFlip save(PackageBoxFlip packageBoxFlip) {
        final MongoUnitOfWork uow = Jmongo.uow();
        packageBoxFlip.getInSilks().forEach(silk -> {
            silk.setPackageDateTime(null);
            silk.setPackageBox(null);
            silk.setDetached(true);
            uow.registerDirty(silk);
        });
        packageBoxFlip.getOutSilks().forEach(silk -> {
            silk.setPackageDateTime(packageBoxFlip.getCreateDateTime());
            silk.setPackageBox(packageBoxFlip.getPackageBox());
            uow.registerDirty(silk);
        });
        final PackageBoxFlip result = super.save(packageBoxFlip);
        Stream.concat(
                result.getInSilks().stream(),
                result.getOutSilks().stream()
        ).forEach(silkLucene::index);
        packageBoxFlipLucene.index(result);
        return result;
    }

    @Override
    public CompletionStage<PackageBoxFlipQuery.Result> query(PackageBoxFlipQuery packageBoxFlipQuery) {
        final int first = packageBoxFlipQuery.getFirst();
        final int pageSize = packageBoxFlipQuery.getPageSize();
        final PackageBoxFlipQuery.Result.ResultBuilder builder = PackageBoxFlipQuery.Result.builder().first(first).pageSize(pageSize);

        return ReactiveStreams.of(packageBoxFlipQuery)
                .map(packageBoxFlipLucene::build)
                .map(it -> packageBoxFlipLucene.baseQuery(it, first, pageSize))
                .peek(it -> builder.count(it.getKey()))
                .map(Pair::getRight)
                .flatMap(ids -> Jmongo.listById(entityClass, ids))
                .toList().run()
                .thenApply(packageBoxes -> builder.packageBoxFlips(packageBoxes).build());
    }
}
