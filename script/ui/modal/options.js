function opts() {
    return [
        { name: 'showAtomIds',
        type: 'boolean',
        defaultValue: false,
        tab: 'atoms' },
        { name: 'hideImplicitHydrogen',
        type: 'boolean',
        defaultValue: false,
        tab: 'atoms' },

        { name: 'Display attached data',
        type: 'boolean',
        defaultValue: false,
        tab: 'attachedData' },

        { name: 'bondLength',
        type: 'number',
        defaultValue: 75,
        values: [75, 100, 150],
        tab: 'bonds' },
        { name: 'showSelectionRegions',
        type: 'boolean',
        defaultValue: false,
        tab: 'bonds' },
        { name: 'showBondIds',
        type: 'boolean',
        defaultValue: false,
        tab: 'bonds' },
        { name: 'showHalfBondIds',
        type: 'boolean',
        defaultValue: false,
        tab: 'bonds' },
        { name: 'showLoopIds',
        type: 'boolean',
        defaultValue: false,
        tab: 'bonds' },

        { name: 'autoScale',
        type: 'boolean',
        defaultValue: false,
        tab: 'scaling' },
        { name: 'autoScaleMargin',
        type: 'number',
        defaultValue: 4,
        values: [2, 4, 8],
        tab: 'scaling' },

        { name: 'Do not show the "Chiral" flag',
        type: 'boolean',
        defaultValue: false,
        tab: 'chemul' },
        { name: 'Show the Data S-Group Tool',
        type: 'boolean',
        defaultValue: false,
        tab: 'chemul' }
    ];
}

module.exports = opts;