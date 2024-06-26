import {
  Atom,
  Editor,
  fromAtomsAttrs,
  fromRGroupAttachmentPointUpdate,
  KetcherLogger,
} from 'ketcher-core';

export async function editRGroupAttachmentPoint(
  editor: Editor,
  atom: Atom,
  atomId: number,
) {
  try {
    const newAtom = await editor.event.elementEdit.dispatch({
      attachmentPoints: atom.attachmentPoints,
    });

    const previousAttachmentPoints = atom?.attachmentPoints;
    const currentAttachmentPoints = newAtom.attachmentPoints;
    if (previousAttachmentPoints !== currentAttachmentPoints) {
      const actionFromAtomsAttrs = fromAtomsAttrs(
        editor.render.ctab,
        atomId,
        newAtom,
        null,
      );
      const actionFromRGroupAttachmentPointUpdate =
        fromRGroupAttachmentPointUpdate(
          editor.render.ctab,
          atomId,
          currentAttachmentPoints,
        );
      const action = actionFromAtomsAttrs.mergeWith(
        actionFromRGroupAttachmentPointUpdate,
      );
      editor.update(action);
    }
  } catch (e) {
    KetcherLogger.error('apoint.utils.ts::editRGroupAttachmentPoint', e);
    // close modal without any operations
  }
}
