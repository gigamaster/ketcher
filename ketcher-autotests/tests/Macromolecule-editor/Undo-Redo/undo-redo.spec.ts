import { Locator, test } from '@playwright/test';
import {
  addSingleMonomerToCanvas,
  clickInTheMiddleOfTheScreen,
  clickRedo,
  clickUndo,
  dragMouseTo,
  hideMonomerPreview,
  moveMouseAway,
  openFileAndAddToCanvasMacro,
  selectRectangleArea,
  selectSnakeLayoutModeTool,
  takeEditorScreenshot,
  takePageScreenshot,
  turnOnMacromoleculesEditor,
  waitForPageInit,
  Peptides as Peptides2,
  selectMonomer,
  clickOnTheCanvas,
  selectRectangleSelectionTool,
  zoomWithMouseWheel,
  selectEraseTool,
  Bases,
  copyToClipboardByKeyboard,
  pasteFromClipboardByKeyboard,
  selectAllStructuresOnCanvas,
  clickOnCanvas,
  selectMacroBond,
} from '@utils';
import { MacroBondTool } from '@utils/canvas/tools/selectNestedTool/types';
import { goToRNATab } from '@utils/macromolecules/library';
import {
  connectMonomersWithBonds,
  moveMonomer,
} from '@utils/macromolecules/monomer';
import { bondTwoMonomers } from '@utils/macromolecules/polymerBond';
import {
  pressRedoButton,
  pressUndoButton,
} from '@utils/macromolecules/topToolBar';
import { Peptides } from '@utils/selectors/macromoleculeEditor';
/* eslint-disable no-magic-numbers */

test.describe('Undo Redo', () => {
  let peptide1: Locator;
  let peptide2: Locator;
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await turnOnMacromoleculesEditor(page);
    const MONOMER_NAME = Peptides.Tza;
    const MONOMER_ALIAS = 'Tza';

    peptide1 = await addSingleMonomerToCanvas(
      page,
      MONOMER_NAME,
      MONOMER_ALIAS,
      300,
      300,
      0,
    );
    peptide2 = await addSingleMonomerToCanvas(
      page,
      MONOMER_NAME,
      MONOMER_ALIAS,
      400,
      300,
      1,
    );
    const peptide3 = await addSingleMonomerToCanvas(
      page,
      MONOMER_NAME,
      MONOMER_ALIAS,
      500,
      300,
      2,
    );

    // Select bond tool
    await selectMacroBond(page, MacroBondTool.SINGLE);

    // Create bonds between peptides
    await bondTwoMonomers(page, peptide1, peptide2);
    await bondTwoMonomers(page, peptide3, peptide2);

    await hideMonomerPreview(page);
  });

  test('Undo redo for monomers and bonds addition', async ({ page }) => {
    /*
    Description: Add monomers and bonds and do undo redo
    */

    // check that history pointer stops on last operation
    await clickRedo(page);
    await clickRedo(page);

    // check undo
    await clickUndo(page);
    await clickUndo(page);
    await takeEditorScreenshot(page);

    // check that history pointer stops on first operation
    await clickUndo(page);
    await clickUndo(page);
    await clickUndo(page);
    await clickUndo(page);
    await clickUndo(page);

    // check redo
    await clickRedo(page);
    await takeEditorScreenshot(page);
  });

  test('Undo redo for snake mode layout', async ({ page }) => {
    /*
    Description: Add monomers and bonds, activate snake mode and do undo redo
    */

    await selectSnakeLayoutModeTool(page);
    await clickUndo(page);
    await takeEditorScreenshot(page);
  });

  test('Undo redo for monomers movement', async ({ page }) => {
    /*
    Description: Move monomers and do undo redo
    */

    await moveMonomer(page, peptide1, 500, 500);
    await moveMonomer(page, peptide2, 600, 600);
    await moveMonomer(page, peptide2, 400, 400);
    await clickUndo(page);
    await clickUndo(page);
    await takeEditorScreenshot(page);
    await clickRedo(page);
    await takeEditorScreenshot(page);
  });

  test('Undo redo for imported structure', async ({ page }) => {
    await openFileAndAddToCanvasMacro(
      'KET/peptide-enumeration-one-two-three.ket',
      page,
    );
    await openFileAndAddToCanvasMacro(
      'KET/peptide-enumeration-one-two-three.ket',
      page,
    );
    await clickUndo(page);
    await takeEditorScreenshot(page);

    const startX = 10;
    const startY = 10;
    const endX = 1900;
    const endY = 1900;
    await selectRectangleArea(page, startX, startY, endX, endY);

    const coords = { x: 100, y: 100 };
    await page.mouse.move(coords.x, coords.y);

    await dragMouseTo(coords.x + 500, coords.y + 500, page);
    await takeEditorScreenshot(page);
  });
});

test.describe('Undo-Redo tests', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await turnOnMacromoleculesEditor(page);
  });

  test('Deleting entities(Peptides, RNA, CHEM, Bonds) and then checking Undo and Redo actions', async ({
    page,
  }) => {
    /* 
    Test case: Undo-Redo tests
    Description: Entities(Peptides, RNA, CHEM, Bonds) are deleted and then Undo and Redo actions.
    */
    await openFileAndAddToCanvasMacro('KET/all-entities.ket', page);
    await page.getByTestId('erase').click();
    const entitiesToDelete = [
      'D-aIle',
      'SertBu',
      'Phe-ol',
      'TyrabD',
      '25R',
      'c3A',
      'msp',
      'cpmA',
      'SMPEG2',
    ];

    for (const entity of entitiesToDelete) {
      await page.getByText(entity).locator('..').first().click();
    }

    const numberOfPress = 9;

    for (let i = 0; i < numberOfPress; i++) {
      await page.getByTestId('undo').click();
    }
    await takeEditorScreenshot(page);

    for (let i = 0; i < numberOfPress; i++) {
      await page.getByTestId('redo').click();
    }
    await takeEditorScreenshot(page);
  });

  test('Track 32 steps (Undo,Redo action)', async ({ page }) => {
    /*
    Test case: Undo-Redo tests
    Description: Add 'Bal___beta-Alanine' monomer to canvas 35 times and then press Undo 32 times.
    */

    const addMonomers = async (x: number, y: number) => {
      await page.getByTestId(Peptides.BetaAlanine).click();
      await clickOnCanvas(page, x, y);
    };

    const numberOfRows = 6;
    const numberOfColumns = 8;
    const step = 100;
    const coordinates = [];

    for (let row = 0; row < numberOfRows; row++) {
      for (let column = 0; column < numberOfColumns; column++) {
        coordinates.push({ x: column * step, y: row * step });
      }
    }

    for (const { x, y } of coordinates) {
      await addMonomers(x, y);
    }

    const maxUndoHistorySize = 32;
    for (let i = 0; i < maxUndoHistorySize; i++) {
      await page.getByTestId('undo').click();
    }
    await takeEditorScreenshot(page);

    const maxRedoHistorySize = 32;
    for (let i = 0; i < maxRedoHistorySize; i++) {
      await page.getByTestId('redo').click();
    }
    await takeEditorScreenshot(page);
  });

  test('Track 32 steps for CHEMs (Undo,Redo action)', async ({ page }) => {
    /*
    Test case: Undo-Redo tests
    Description: Add 'SMPEG2___SM(PEG)2 linker from Pierce' CHEM to canvas 35 times and then press Undo 32 times.
    */

    const addMonomers = async (x: number, y: number) => {
      await page.getByTestId('CHEM-TAB').click();
      await page.getByTestId('SMPEG2___SM(PEG)2').click();
      await clickOnCanvas(page, x, y);
    };

    const numberOfRows = 6;
    const numberOfColumns = 8;
    const step = 100;
    const coordinates = [];

    for (let row = 0; row < numberOfRows; row++) {
      for (let column = 0; column < numberOfColumns; column++) {
        coordinates.push({ x: column * step, y: row * step });
      }
    }

    for (const { x, y } of coordinates) {
      await addMonomers(x, y);
    }

    const maxUndoHistorySize = 32;
    for (let i = 0; i < maxUndoHistorySize; i++) {
      await page.getByTestId('undo').click();
    }
    await takeEditorScreenshot(page);

    const maxRedoHistorySize = 32;
    for (let i = 0; i < maxRedoHistorySize; i++) {
      await page.getByTestId('redo').click();
    }
    await takeEditorScreenshot(page);
  });

  test('After placing a monomers on canvas and deleting some of them check that short key "Control + Z" and "Control+Y" are working', async ({
    page,
  }) => {
    /* 
    Test case: Undo-Redo tests
    Description: Short key "Control + Z" and "Control+Y" are working.
    */
    await openFileAndAddToCanvasMacro('KET/all-entities.ket', page);
    await page.getByTestId('erase').click();
    const entitiesToDelete = [
      'SertBu',
      'TyrabD',
      '25R',
      'c3A',
      'msp',
      'SMPEG2',
    ];

    for (const entity of entitiesToDelete) {
      await page.getByText(entity).locator('..').first().click();
    }

    const numberOfPress = 6;

    for (let i = 0; i < numberOfPress; i++) {
      await page.keyboard.press('Control+z');
    }
    await takeEditorScreenshot(page);

    for (let i = 0; i < numberOfPress; i++) {
      await page.keyboard.press('Control+y');
    }
    await takeEditorScreenshot(page);
  });

  test('Press Undo/Redo after opening a .ket file with monomers', async ({
    page,
  }) => {
    /* 
    Test case: Undo-Redo tests
    Description: Undo/Redo after opening  a .ket file is working.
    */
    await openFileAndAddToCanvasMacro('KET/all-entities.ket', page);
    await page.getByTestId('undo').click();
    await takeEditorScreenshot(page);
    await page.getByTestId('redo').click();
    await takeEditorScreenshot(page);
  });

  test('Press Undo/Redo after opening  a .mol file with monomers', async ({
    page,
  }) => {
    /* 
    Test case: Undo-Redo tests
    Description: Undo/Redo after opening  a .mol file is working.
    */
    await openFileAndAddToCanvasMacro(
      'Molfiles-V3000/monomers-connected-with-bonds.mol',
      page,
    );
    await page.getByTestId('undo').click();
    await takeEditorScreenshot(page);
    await page.getByTestId('redo').click();
    await takeEditorScreenshot(page);
  });

  test('Check that undo/redo toggle snake mode', async ({ page }) => {
    /* 
    Test case: Undo-Redo tests
    Description: Pressing Undo/Redo toggle snake mode.
    */
    await openFileAndAddToCanvasMacro(
      'KET/peptides-connected-with-bonds.ket',
      page,
    );
    await selectSnakeLayoutModeTool(page);
    await page.getByTestId('undo').click();
    await takePageScreenshot(page);
    await page.getByTestId('redo').click();
    await takeEditorScreenshot(page);
    await takePageScreenshot(page);
  });

  test('After creating a chain of Peptides and clicking multiple times "Undo" button to verify that the last actions are properly reversed', async ({
    page,
  }) => {
    /*
    Test case: Undo-Redo tests
    Description: Add ten monomers and connect them with bonds and undo 5 times then redo 5 times.
    */
    const monomerNames = [
      'Bal',
      'Edc',
      'dD',
      'dW',
      'meF',
      'Sar',
      'meI',
      'meK',
      'Nle',
      'meM',
      'Mhp',
      'Pen',
    ];
    await openFileAndAddToCanvasMacro(
      'KET/ten-peptides-not-connected.ket',
      page,
    );
    await connectMonomersWithBonds(page, monomerNames);
    const maxUndoHistorySize = 5;
    for (let i = 0; i < maxUndoHistorySize; i++) {
      await page.getByTestId('undo').click();
    }
    await takeEditorScreenshot(page);

    const maxRedoHistorySize = 5;
    for (let i = 0; i < maxRedoHistorySize; i++) {
      await page.getByTestId('redo').click();
    }
    await takeEditorScreenshot(page);
  });

  test('Check that after undoing and redoing all steps, Undo and Redo buttons turn gray', async ({
    page,
  }) => {
    /* 
    Test case: Undo-Redo tests
    Description: Undo and Redo buttons turn gray.
    The test is not working correctly because we have an unresolved bug. https://github.com/epam/ketcher/issues/3922
    */
    await takePageScreenshot(page);
    await page.getByTestId('Edc___S-ethylthiocysteine').click();
    await clickInTheMiddleOfTheScreen(page);
    await page.getByTestId('undo').click();
    await takePageScreenshot(page);
    await page.getByTestId('redo').click();
    await takePageScreenshot(page);
  });

  test('Press Undo/Redo after copy/pasting Sugar-Base-Phosphate structure on canvas', async ({
    page,
  }) => {
    /* 
    Test case: Undo-Redo tests
    Description: Copy/Paste working as expected and Undo/Redo
    */
    const x = 200;
    const y = 200;
    await page.getByTestId('RNA-TAB').click();
    await page.getByTestId('C_C_R_P').click();
    await clickInTheMiddleOfTheScreen(page);
    await selectAllStructuresOnCanvas(page);
    await copyToClipboardByKeyboard(page);
    await page.mouse.move(x, y);
    await pasteFromClipboardByKeyboard(page);
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
    await page.getByTestId('undo').click();
    await takeEditorScreenshot(page);
    await page.getByTestId('redo').click();
    await takeEditorScreenshot(page);
  });

  test('Verify the undo/redo functionality with ambiguous peptide (X) on the canvas', async ({
    page,
  }) => {
    /* 
    Test task: https://github.com/epam/ketcher/issues/5558
    Description: 12.1 Verify the undo/redo functionality with ambiguous peptide (X) on the canvas
    Case: 1. Put on the center of canvas ambiguous monomer from the library (peptide X)
          2. Take screenshot to make sure it is on canvas
          3. Select it
          4. Press Delete button
          5. Take screenshot to make sure canvas is empty
          6. Press Undo button
          7. Take screenshot to make sure it returned back
          8. Press Redo button
          9. Take screenshot to make sure it is on canvas
    */
    await goToRNATab(page);
    await selectMonomer(page, Peptides2.X);
    await clickOnTheCanvas(page, 0, 0);

    await selectRectangleSelectionTool(page);
    await zoomWithMouseWheel(page, -600);
    await takeEditorScreenshot(page);

    await clickOnTheCanvas(page, 0, 0);
    await selectEraseTool(page);

    await takeEditorScreenshot(page);

    await pressUndoButton(page);

    await takeEditorScreenshot(page);

    await pressRedoButton(page);

    await takeEditorScreenshot(page);
    await zoomWithMouseWheel(page, 600);
  });

  test('Verify the undo/redo functionality with ambiguous Base (RNA_N) on the canvas', async ({
    page,
  }) => {
    /* 
    Test task: https://github.com/epam/ketcher/issues/5558
    Description: 12.2 Verify the undo/redo functionality with ambiguous Base (RNA_N) on the canvas
    Case: 1. Put on the center of canvas ambiguous monomer from the library (peptide X)
          2. Take screenshot to make sure it is on canvas
          3. Select it
          4. Press Delete button
          5. Take screenshot to make sure canvas is empty
          6. Press Undo button
          7. Take screenshot to make sure it returned back
          8. Press Redo button
          9. Take screenshot to make sure it is on canvas
    */
    await goToRNATab(page);
    await selectMonomer(page, Bases.DNA_N);
    await clickOnTheCanvas(page, 0, 0);

    await selectRectangleSelectionTool(page);
    await zoomWithMouseWheel(page, -600);
    await takeEditorScreenshot(page);

    await clickOnTheCanvas(page, 0, 0);
    await selectEraseTool(page);

    await takeEditorScreenshot(page);

    await pressUndoButton(page);

    await takeEditorScreenshot(page);

    await pressRedoButton(page);

    await takeEditorScreenshot(page);
    await zoomWithMouseWheel(page, 600);
  });
});
