const handleCopyAddress = async (checked) => {
    if (!checked) {
      setValue("PermanentAddressType", "Please Select");
      return;
    }

    const presentSection = formSections.find(
      (sec) => sec.section === "Present Address Details"
    );
    const permanentSection = formSections.find(
      (sec) => sec.section === "Permanent Address Details"
    );

    if (!presentSection || !permanentSection) {
      console.warn("Present or Permanent Address section not found");
      return;
    }

    const permanentSectionIndex = formSections.findIndex(
      (sec) => sec.section === "Permanent Address Details"
    );

    // ✅ Dynamically find the address type fields by name
    const presentTypeField = presentSection.fields.find(
      (field) => field.name === "PresentAddressType"
    );
    const permanentTypeField = permanentSection.fields.find(
      (field) => field.name === "PermanentAddressType"
    );

    if (!presentTypeField || !permanentTypeField) {
      console.warn("Address type fields not found in sections");
      return;
    }

    const presentAddressType = getValues(presentTypeField.name);
    let permanentAddressType = getValues(permanentTypeField.name);

    if (
      permanentAddressType === "Please Select" ||
      !["Urban", "Rural"].includes(permanentAddressType)
    ) {
      permanentAddressType = presentAddressType;
      setValue(permanentTypeField.name, presentAddressType, {
        shouldValidate: true,
      });
    }

    setValue(permanentTypeField.name, presentAddressType, {
      shouldValidate: true,
    });

    const presentAdditionalFields =
      presentTypeField.additionalFields?.[presentAddressType] || [];

    const permanentAdditionalFields =
      permanentTypeField.additionalFields?.[permanentAddressType] || [];

    if (!permanentAdditionalFields.length) {
      console.warn(
        `No permanent additional fields found for AddressType: ${permanentAddressType}`
      );
      return;
    }

    permanentAdditionalFields.forEach((field) => {
      setValue(field.name, "", { shouldValidate: false });
    });

    const fieldNameMap = {
      PresentDistrict: "PermanentDistrict",
      PresentMuncipality: "PermanentMuncipality",
      PresentMunicipality: "PermanentMuncipality",
      PresentWardNo: "PermanentWardNo",
      PresentBlock: "PermanentBlock",
      PresentHalqaPanchayat: "PermanentHalqaPanchayat",
      PresentVillage: "PermanentVillage",
    };

    for (const presentField of presentAdditionalFields) {
      let permanentFieldName =
        fieldNameMap[presentField.name] ||
        presentField.name.replace("Present", "Permanent");

      const permanentField = permanentAdditionalFields.find(
        (f) => f.name.toLowerCase() === permanentFieldName.toLowerCase()
      );

      if (!permanentField) {
        console.warn(
          `Permanent field not found for ${presentField.name}. Expected: ${permanentFieldName}`
        );
        continue;
      }

      const fieldValue = getValues(presentField.name);
      setValue(permanentField.name, fieldValue, { shouldValidate: true });

      if (
        /District|Muncipality|Municipality|Block|HalqaPanchayat|Ward|Village/.test(
          presentField.name
        )
      ) {
        await handleAreaChange(
          permanentSectionIndex,
          permanentField,
          fieldValue
        );
      }
    }

    const validateFields = async () => {
      await trigger(permanentTypeField.name);
      for (const field of permanentAdditionalFields) {
        try {
          await trigger(field.name);
        } catch (error) {
          console.warn(`Validation failed for ${field.name}: ${error.message}`);
        }
      }
    };

    await validateFields();
  };