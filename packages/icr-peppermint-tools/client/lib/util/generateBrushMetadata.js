import GeneralAnatomyList from "../GeneralAnatomylist.js";

const categories = GeneralAnatomyList.SegmentationCodes.Category;

export default function generateMetadata(
  label,
  categoryUID,
  typeUID,
  modifierUID
) {
  let Type;

  const category = categories.find(
    categoriesI => categoriesI.CodeValue === categoryUID
  );
  const type = category.Type.find(typesI => typesI.CodeValue === typeUID);

  const metadata = {
    SegmentedPropertyCategoryCodeSequence: {
      CodeValue: category.CodeValue,
      CodingSchemeDesignator: category.CodingSchemeDesignator,
      CodeMeaning: category.CodeMeaning
    },
    SegmentLabel: label,
    SegmentAlgorithmType: "MANUAL",

    SegmentedPropertyTypeCodeSequence: {
      CodeValue: type.CodeValue,
      CodingSchemeDesignator: type.CodingSchemeDesignator,
      CodeMeaning: type.CodeMeaning
    }
  };

  if (modifierUID) {
    const modfier = type.Modifier.find(
      modifierI => modifierI.CodeValue === modifierUID
    );

    metadata.SegmentedPropertyTypeCodeSequence.SegmentedPropertyTypeModifierCodeSequence = {
      CodeValue: modfier.CodeValue,
      CodingSchemeDesignator: modfier.CodingSchemeDesignator,
      CodeMeaning: modfier.CodeMeaning
    };

    metadata.RecommendedDisplayCIELabValue = modfier.recommendedDisplayRGBValue;
  } else {
    metadata.RecommendedDisplayCIELabValue = type.recommendedDisplayRGBValue;
  }

  return metadata;
}
