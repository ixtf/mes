package com.hengyi.japp.mes.auto.repository;

import com.hengyi.japp.mes.auto.application.query.PackageBoxFlipQuery;
import com.hengyi.japp.mes.auto.domain.PackageBoxFlip;

import java.util.Optional;
import java.util.concurrent.CompletionStage;

/**
 * @author jzb 2018-06-24
 */
public interface PackageBoxFlipRepository {

    PackageBoxFlip save(PackageBoxFlip packageBoxFlip);

    Optional<PackageBoxFlip> find(String id);

    CompletionStage<PackageBoxFlipQuery.Result> query(PackageBoxFlipQuery query);

}
