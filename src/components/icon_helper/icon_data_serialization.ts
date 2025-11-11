

interface SerializedIcon {
  pack: IconPack;
  name: string;
  family?: string;
}

export const serializeIcon = (name: string, iconPack?: IconPack): SerializedIcon => {

  return {
    pack: iconPack ?? IconPack.material,
    name: name, // Store the actual icon name directly
  };
};

export const deserializeIcon = (iconMap: SerializedIcon): { name: string; family: string } | null => {
  const { pack, name } = iconMap;

  // Map packs to react-native-vector-icons families
  const packToFamily: { [key: string]: string } = {
    'material': 'MaterialIcons',
    'cupertino': 'Ionicons',
    'fontAwesome': 'FontAwesome',
    'lineAwesome': 'FontAwesome5',
    'custom': iconMap.family || 'MaterialIcons'
  };

  const family = packToFamily[pack];

  if (!family) {
    console.warn(`Unknown icon pack: ${pack}`);
    return null;
  }

  return { name, family };
};

