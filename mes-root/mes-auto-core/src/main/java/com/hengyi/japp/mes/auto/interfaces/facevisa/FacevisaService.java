package com.hengyi.japp.mes.auto.interfaces.facevisa;

import com.hengyi.japp.mes.auto.interfaces.facevisa.dto.AutoVisualInspectionSilkInfoDTO;
import com.hengyi.japp.mes.auto.interfaces.jikon.dto.GetSilkSpindleInfoDTO;
import io.reactivex.Completable;

/**
 * @author jzb 2018-10-20
 */
public interface FacevisaService {

    AutoVisualInspectionSilkInfoDTO autoVisualInspection_silkInfo(String code);

    Completable prepare(GetSilkSpindleInfoDTO dto);
}
