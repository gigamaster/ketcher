import { RxnPlus, RxnArrow } from '../../../chem/struct'
import Vec2 from '../../../util/vec2'

export function rxnToStruct(graphItem, struct) {
  if (graphItem.type === 'arrow') {
    struct.rxnArrows.add(
      new RxnArrow(
        new Vec2(
          graphItem.location[0],
          graphItem.location[1],
          graphItem.location[2]
        ),
        graphItem.mode
      )
    )
  } else {
    struct.rxnPluses.add(
      new RxnPlus({
        pp: {
          x: graphItem.location[0],
          y: graphItem.location[1],
          z: graphItem.location[2]
        }
      })
    )
  }
  return struct
}
