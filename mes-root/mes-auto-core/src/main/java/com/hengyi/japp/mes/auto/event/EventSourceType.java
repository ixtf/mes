package com.hengyi.japp.mes.auto.event;

import com.fasterxml.jackson.databind.JsonNode;

/**
 * @author jzb 2018-08-09
 */
public enum EventSourceType {
    SilkCarRuntimeInitEvent {
        @Override
        public SilkCarRuntimeInitEvent.DTO toDto(JsonNode jsonNode) {
            return com.hengyi.japp.mes.auto.event.SilkCarRuntimeInitEvent.DTO.from(jsonNode);
        }
    },
    SilkCarRuntimeAppendEvent {
        @Override
        public SilkCarRuntimeAppendEvent.DTO toDto(JsonNode jsonNode) {
            return com.hengyi.japp.mes.auto.event.SilkCarRuntimeAppendEvent.DTO.from(jsonNode);
        }
    },
    BigSilkCarSilkChangeEvent {
        @Override
        public BigSilkCarSilkChangeEvent.DTO toDto(JsonNode jsonNode) {
            return com.hengyi.japp.mes.auto.event.BigSilkCarSilkChangeEvent.DTO.from(jsonNode);
        }
    },

    SilkCarRuntimeGradeEvent {
        @Override
        public SilkCarRuntimeGradeEvent.DTO toDto(JsonNode jsonNode) {
            return com.hengyi.japp.mes.auto.event.SilkCarRuntimeGradeEvent.DTO.from(jsonNode);
        }
    },

    SilkCarRuntimeWeightEvent {
        @Override
        public SilkCarRuntimeWeightEvent.DTO toDto(JsonNode jsonNode) {
            return com.hengyi.japp.mes.auto.event.SilkCarRuntimeWeightEvent.DTO.from(jsonNode);
        }
    },

    SilkRuntimeDetachEvent {
        @Override
        public SilkRuntimeDetachEvent.DTO toDto(JsonNode jsonNode) {
            return com.hengyi.japp.mes.auto.event.SilkRuntimeDetachEvent.DTO.from(jsonNode);
        }
    },

    SilkCarRuntimeGradeSubmitEvent {
        @Override
        public SilkCarRuntimeGradeSubmitEvent.DTO toDto(JsonNode jsonNode) {
            return com.hengyi.japp.mes.auto.event.SilkCarRuntimeGradeSubmitEvent.DTO.from(jsonNode);
        }
    },

    DyeingSampleSubmitEvent {
        @Override
        public DyeingSampleSubmitEvent.DTO toDto(JsonNode jsonNode) {
            return com.hengyi.japp.mes.auto.event.DyeingSampleSubmitEvent.DTO.from(jsonNode);
        }
    },

    TemporaryBoxEvent {
        @Override
        public TemporaryBoxEvent.DTO toDto(JsonNode jsonNode) {
            return com.hengyi.japp.mes.auto.event.TemporaryBoxEvent.DTO.from(jsonNode);
        }
    },

    ToDtyEvent {
        @Override
        public ToDtyEvent.DTO toDto(JsonNode jsonNode) {
            return com.hengyi.japp.mes.auto.event.ToDtyEvent.DTO.from(jsonNode);
        }
    },

    ToDtyConfirmEvent {
        @Override
        public ToDtyConfirmEvent.DTO toDto(JsonNode jsonNode) {
            return com.hengyi.japp.mes.auto.event.ToDtyConfirmEvent.DTO.from(jsonNode);
        }
    },

    ProductProcessSubmitEvent {
        @Override
        public ProductProcessSubmitEvent.DTO toDto(JsonNode jsonNode) {
            return com.hengyi.japp.mes.auto.event.ProductProcessSubmitEvent.DTO.from(jsonNode);
        }
    },

    ExceptionCleanEvent {
        @Override
        public ExceptionCleanEvent.DTO toDto(JsonNode jsonNode) {
            return com.hengyi.japp.mes.auto.event.ExceptionCleanEvent.DTO.from(jsonNode);
        }
    },

    DyeingPrepareEvent {
        @Override
        public DyeingPrepareEvent.DTO toDto(JsonNode jsonNode) {
            return com.hengyi.japp.mes.auto.event.DyeingPrepareEvent.DTO.from(jsonNode);
        }
    },

    PackageBoxEvent {
        @Override
        public PackageBoxEvent.DTO toDto(JsonNode jsonNode) {
            return com.hengyi.japp.mes.auto.event.PackageBoxEvent.DTO.from(jsonNode);
        }
    },

    SmallPackageBoxEvent {
        @Override
        public SmallPackageBoxEvent.DTO toDto(JsonNode jsonNode) {
            return com.hengyi.japp.mes.auto.event.SmallPackageBoxEvent.DTO.from(jsonNode);
        }
    },

    PackageBoxFlipEvent {
        @Override
        public PackageBoxFlipEvent.DTO toDto(JsonNode jsonNode) {
            return com.hengyi.japp.mes.auto.event.PackageBoxFlipEvent.DTO.from(jsonNode);
        }
    },

    SilkNoteFeedbackEvent {
        @Override
        public SilkNoteFeedbackEvent.DTO toDto(JsonNode jsonNode) {
            return com.hengyi.japp.mes.auto.event.SilkNoteFeedbackEvent.DTO.from(jsonNode);
        }
    };

//    JikonAdapterSilkCarInfoFetchEvent {
//        @Override
//        public JikonAdapterSilkCarInfoFetchEvent.DTO toDto(JsonNode jsonNode) {
//            return com.hengyi.japp.mes.auto.interfaces.jikon.event.JikonAdapterSilkCarInfoFetchEvent.DTO.from(jsonNode);
//        }
//
//        @Override
//        public Single<JikonAdapterSilkCarInfoFetchEvent> from(JsonNode jsonNode) {
//            return toDto(jsonNode).toEvent();
//        }
//    },

//    JikonAdapterSilkDetachEvent {
//        @Override
//        public com.hengyi.japp.mes.auto.interfaces.jikon.event.JikonAdapterSilkDetachEvent.DTO toDto(JsonNode jsonNode) {
//            return com.hengyi.japp.mes.auto.interfaces.jikon.event.JikonAdapterSilkDetachEvent.DTO.from(jsonNode);
//        }
//
//        @Override
//        public Single<com.hengyi.japp.mes.auto.interfaces.jikon.event.JikonAdapterSilkDetachEvent> from(JsonNode jsonNode) {
//            return toDto(jsonNode).toEvent();
//        }
//    },

//    JikonAdapterPackageBoxEvent {
//        @Override
//        public com.hengyi.japp.mes.auto.interfaces.jikon.event.JikonAdapterPackageBoxEvent.DTO toDto(JsonNode jsonNode) {
//            return com.hengyi.japp.mes.auto.interfaces.jikon.event.JikonAdapterPackageBoxEvent.DTO.from(jsonNode);
//        }
//
//        @Override
//        public Single<com.hengyi.japp.mes.auto.interfaces.jikon.event.JikonAdapterPackageBoxEvent> from(JsonNode jsonNode) {
//            return toDto(jsonNode).toEvent();
//        }
//    },

//    RiambSilkCarInfoFetchEvent {
//        @Override
//        public com.hengyi.japp.mes.auto.interfaces.riamb.event.RiambSilkCarInfoFetchEvent.DTO toDto(JsonNode jsonNode) {
//            return com.hengyi.japp.mes.auto.interfaces.riamb.event.RiambSilkCarInfoFetchEvent.DTO.from(jsonNode);
//        }
//
//        @Override
//        public Single<com.hengyi.japp.mes.auto.interfaces.riamb.event.RiambSilkCarInfoFetchEvent> from(JsonNode jsonNode) {
//            return toDto(jsonNode).toEvent();
//        }
//    },

//    RiambSilkDetachEvent {
//        @Override
//        public com.hengyi.japp.mes.auto.interfaces.riamb.event.RiambSilkDetachEvent.DTO toDto(JsonNode jsonNode) {
//            return com.hengyi.japp.mes.auto.interfaces.riamb.event.RiambSilkDetachEvent.DTO.from(jsonNode);
//        }
//
//        @Override
//        public Single<com.hengyi.japp.mes.auto.interfaces.riamb.event.RiambSilkDetachEvent> from(JsonNode jsonNode) {
//            return toDto(jsonNode).toEvent();
//        }
//    },

//    RiambPackageBoxEvent {
//        @Override
//        public com.hengyi.japp.mes.auto.interfaces.riamb.event.RiambPackageBoxEvent.DTO toDto(JsonNode jsonNode) {
//            return com.hengyi.japp.mes.auto.interfaces.riamb.event.RiambPackageBoxEvent.DTO.from(jsonNode);
//        }
//
//        @Override
//        public Single<com.hengyi.japp.mes.auto.interfaces.riamb.event.RiambPackageBoxEvent> from(JsonNode jsonNode) {
//            return toDto(jsonNode).toEvent();
//        }
//    },

//    WarehousePackageBoxFetchEvent {
//        @Override
//        public com.hengyi.japp.mes.auto.interfaces.warehouse.event.WarehousePackageBoxFetchEvent.DTO toDto(JsonNode jsonNode) {
//            return com.hengyi.japp.mes.auto.interfaces.warehouse.event.WarehousePackageBoxFetchEvent.DTO.from(jsonNode);
//        }
//    };

    public abstract <T extends EventSource.DTO> T toDto(JsonNode jsonNode);

}
