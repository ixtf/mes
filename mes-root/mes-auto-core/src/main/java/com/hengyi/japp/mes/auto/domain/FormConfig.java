package com.hengyi.japp.mes.auto.domain;

import com.fasterxml.jackson.annotation.JsonGetter;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.type.CollectionLikeType;
import com.hengyi.japp.mes.auto.domain.data.FormFieldConfig;
import lombok.*;
import org.apache.commons.lang3.StringUtils;
import org.bson.types.ObjectId;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Date;
import java.util.stream.Collectors;

import static com.github.ixtf.japp.core.Constant.MAPPER;

/**
 * @author jzb 2018-07-27
 */
@NoArgsConstructor
@ToString(onlyExplicitlyIncluded = true)
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Entity
public class FormConfig implements EntityLoggable {
    @ToString.Include
    @EqualsAndHashCode.Include
    @Getter
    @Setter
    @Id
    private String id;
    @ToString.Include
    @Getter
    @Setter
    @Column
    @NotBlank
    private String name;
    @JsonIgnore
    @Getter
    @Setter
    @Column(name = "config")
    private String configString;

    @JsonIgnore
    @Getter
    @Setter
    @Column
    @NotNull
    private Operator creator;
    @JsonIgnore
    @Getter
    @Setter
    @Column(name = "cdt")
    @NotNull
    private Date createDateTime;
    @JsonIgnore
    @Getter
    @Setter
    @Column
    private Operator modifier;
    @JsonIgnore
    @Getter
    @Setter
    @Column(name = "mdt")
    private Date modifyDateTime;
    @JsonIgnore
    @Getter
    @Setter
    @Column
    private boolean deleted;

    @JsonGetter("formFieldConfigs")
    public Collection<FormFieldConfig> formFieldConfigs() throws IOException {
        final CollectionLikeType type = MAPPER.getTypeFactory().constructCollectionLikeType(ArrayList.class, FormFieldConfig.class);
        return MAPPER.readValue(getConfigString(), type);
    }

    public void formFieldsConfig(Collection<FormFieldConfig> formFieldConfigs) throws JsonProcessingException {
        final Collection<FormFieldConfig> value = formFieldConfigs.stream()
                .map(it -> {
                    if (StringUtils.isBlank(it.getId())) {
                        it.setId(new ObjectId().toHexString());
                    }
                    return it;
                })
                .collect(Collectors.toList());
        setConfigString(MAPPER.writeValueAsString(value));
    }

    @Data
    public static class FormFieldValue {
        @NotBlank
        private String id;
        private String valueString;
        //多选字段的值
        private Collection<String> valuesString;
    }

}
