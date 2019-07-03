package com.hengyi.japp.mes.auto.application.event;

/**
 * @author jzb 2018-08-09
 */
public enum EventSourceType {
    SilkCarRuntimeInitEvent,

    SilkCarRuntimeAppendEvent,

    SilkCarRuntimeGradeEvent,

    SilkRuntimeDetachEvent,

    SilkCarRuntimeGradeSubmitEvent,

    DyeingSampleSubmitEvent,

    TemporaryBoxEvent,

    ProductProcessSubmitEvent,

    ExceptionCleanEvent,

    DyeingPrepareEvent,

    PackageBoxEvent,

    PackageBoxFlipEvent,

    SilkNoteFeedbackEvent,

    JikonAdapterSilkCarInfoFetchEvent,

    JikonAdapterSilkDetachEvent,

    JikonAdapterPackageBoxEvent,

    RiambPackageBoxEvent,

    RiambSilkCarInfoFetchEvent,

    RiambSilkDetachEvent,

    WarehousePackageBoxFetchEvent;

}
