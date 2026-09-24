import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const TreasureChestGraphic = ({ level = 1, isSelected = false, size = 48 }) => {
  // Theme per level
  const themes = {
    1: {
      name: 'Emerald Wood Chest',
      woodPlank: '#15803d',
      woodDark: '#166534',
      metalBand: '#cbd5e1',
      metalHighlight: '#f8fafc',
      lockPlate: '#e2e8f0',
      keyhole: '#0f172a',
      gem: '#22c55e',
      glow: '#22c55e',
      hasWings: false,
      hasCrown: false
    },
    2: {
      name: 'Cyan Diamond Chest',
      woodPlank: '#0284c7',
      woodDark: '#0369a1',
      metalBand: '#38bdf8',
      metalHighlight: '#e0f2fe',
      lockPlate: '#bae6fd',
      keyhole: '#0369a1',
      gem: '#00f0ff',
      glow: '#00f0ff',
      hasWings: false,
      hasCrown: false
    },
    3: {
      name: 'Royal Sapphire Gold Chest',
      woodPlank: '#1e3a8a',
      woodDark: '#172554',
      metalBand: '#f59e0b',
      metalHighlight: '#fef08a',
      lockPlate: '#fbbf24',
      keyhole: '#78350f',
      gem: '#06b6d4',
      glow: '#3b82f6',
      hasWings: false,
      hasCrown: false
    },
    4: {
      name: 'Amethyst Imperial Vault',
      woodPlank: '#7e22ce',
      woodDark: '#581c87',
      metalBand: '#f59e0b',
      metalHighlight: '#fef08a',
      lockPlate: '#fbbf24',
      keyhole: '#581c87',
      gem: '#ef4444',
      glow: '#d946ef',
      hasWings: false,
      hasCrown: false
    },
    5: {
      name: 'Golden Sun God Winged Vault',
      woodPlank: '#b91c1c',
      woodDark: '#7f1d1d',
      metalBand: '#facc15',
      metalHighlight: '#fef9c3',
      lockPlate: '#fbbf24',
      keyhole: '#78350f',
      gem: '#fbbf24',
      glow: '#f59e0b',
      hasWings: true,
      hasCrown: true
    }
  };

  const t = themes[level] || themes[1];
  const scale = size / 48;

  return (
    <View style={[styles.root, { width: size + (t.hasWings ? 18 : 0), height: size + 6 }]}>
      {/* Level 5 Spread Angel Wings */}
      {t.hasWings && (
        <View style={styles.wingsContainer}>
          <Text style={[styles.wingLeft, { fontSize: Math.floor(20 * scale) }]}>🪽</Text>
          <Text style={[styles.wingRight, { fontSize: Math.floor(20 * scale) }]}>🪽</Text>
        </View>
      )}

      {/* Level 5 Crown at the top */}
      {t.hasCrown && (
        <View style={styles.crownTop}>
          <Text style={{ fontSize: Math.floor(11 * scale) }}>👑</Text>
        </View>
      )}

      {/* Main 3D Chest Container */}
      <View
        style={[
          styles.chestWrapper,
          {
            width: size,
            height: Math.round(size * 0.76),
            shadowColor: t.glow,
            shadowOpacity: isSelected ? 0.95 : 0.45,
            shadowRadius: isSelected ? 10 : 5
          }
        ]}
      >
        {/* Top 3D Domed Lid */}
        <View
          style={[
            styles.domeLid,
            {
              backgroundColor: t.woodPlank,
              borderColor: t.metalBand,
              borderBottomColor: 'rgba(0,0,0,0.5)'
            }
          ]}
        >
          {/* Top highlight glare */}
          <View style={styles.topGlossGlare} />

          {/* Left & Right Metal Straps on Lid */}
          <View style={[styles.lidStrap, { left: '20%', backgroundColor: t.metalBand }]}>
            <View style={[styles.rivetDot, { backgroundColor: t.metalHighlight }]} />
          </View>
          <View style={[styles.lidStrap, { right: '20%', backgroundColor: t.metalBand }]}>
            <View style={[styles.rivetDot, { backgroundColor: t.metalHighlight }]} />
          </View>

          {/* Center Hasp Latch Top */}
          <View style={[styles.haspTop, { backgroundColor: t.lockPlate, borderColor: t.metalBand }]} />
        </View>

        {/* Bottom 3D Storage Chest Chamber */}
        <View
          style={[
            styles.chestBase,
            {
              backgroundColor: t.woodDark,
              borderColor: t.metalBand
            }
          ]}
        >
          {/* Left & Right Metal Straps on Base */}
          <View style={[styles.baseStrap, { left: '20%', backgroundColor: t.metalBand }]}>
            <View style={[styles.rivetDot, { backgroundColor: t.metalHighlight, bottom: 2 }]} />
          </View>
          <View style={[styles.baseStrap, { right: '20%', backgroundColor: t.metalBand }]}>
            <View style={[styles.rivetDot, { backgroundColor: t.metalHighlight, bottom: 2 }]} />
          </View>

          {/* Side Iron Carry Rings */}
          <View style={[styles.sideHandleLeft, { borderColor: t.metalBand }]} />
          <View style={[styles.sideHandleRight, { borderColor: t.metalBand }]} />

          {/* Center Iconic Padlock / Gem Clasp */}
          <View
            style={[
              styles.padlockHousing,
              {
                backgroundColor: t.lockPlate,
                borderColor: t.metalHighlight,
                shadowColor: t.gem
              }
            ]}
          >
            {/* Embedded Gemstone / Keyhole */}
            <View style={[styles.gemCore, { backgroundColor: t.gem }]}>
              <View style={[styles.keyholeCutout, { backgroundColor: t.keyhole }]} />
            </View>
          </View>

          {/* Base bottom rim */}
          <View style={[styles.baseBottomRim, { backgroundColor: t.metalBand }]} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative'
  },
  wingsContainer: {
    position: 'absolute',
    top: 4,
    left: -4,
    right: -4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 1
  },
  wingLeft: {
    transform: [{ rotate: '-12deg' }]
  },
  wingRight: {
    transform: [{ scaleX: -1 }, { rotate: '-12deg' }]
  },
  crownTop: {
    position: 'absolute',
    top: -9,
    alignSelf: 'center',
    zIndex: 10
  },
  chestWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    elevation: 6
  },
  domeLid: {
    width: '92%',
    height: '44%',
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    borderWidth: 1.6,
    borderBottomWidth: 1.2,
    position: 'relative',
    overflow: 'hidden'
  },
  topGlossGlare: {
    position: 'absolute',
    top: 1,
    left: 4,
    right: 4,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    borderRadius: 3
  },
  lidStrap: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 4.5,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 2
  },
  rivetDot: {
    width: 2.2,
    height: 2.2,
    borderRadius: 1.1
  },
  haspTop: {
    position: 'absolute',
    bottom: 0,
    alignSelf: 'center',
    width: 10,
    height: 4,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
    borderWidth: 1,
    borderBottomWidth: 0
  },
  chestBase: {
    width: '100%',
    height: '56%',
    borderBottomLeftRadius: 7,
    borderBottomRightRadius: 7,
    borderWidth: 1.6,
    borderTopWidth: 0,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center'
  },
  baseStrap: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 4.5,
    alignItems: 'center',
    justifyContent: 'flex-end'
  },
  sideHandleLeft: {
    position: 'absolute',
    left: -3,
    top: '30%',
    width: 3.5,
    height: 7,
    borderTopLeftRadius: 3,
    borderBottomLeftRadius: 3,
    borderWidth: 1,
    borderRightWidth: 0
  },
  sideHandleRight: {
    position: 'absolute',
    right: -3,
    top: '30%',
    width: 3.5,
    height: 7,
    borderTopRightRadius: 3,
    borderBottomRightRadius: 3,
    borderWidth: 1,
    borderLeftWidth: 0
  },
  padlockHousing: {
    position: 'absolute',
    top: -5,
    width: 15,
    height: 16,
    borderRadius: 4,
    borderWidth: 1.2,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
    elevation: 5
  },
  gemCore: {
    width: 7,
    height: 8,
    borderRadius: 2,
    alignItems: 'center',
    justifyContent: 'center'
  },
  keyholeCutout: {
    width: 2.2,
    height: 4,
    borderRadius: 1
  },
  baseBottomRim: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2.5
  }
});
