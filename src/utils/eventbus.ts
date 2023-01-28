import mitt from 'mitt';

type Events = {
  'toolType:update': string;
  bar?: number;
};

const emitter = mitt<Events>(); // inferred as Emitter<Events>

const bus = {
  $on: emitter.on,
  $emit: emitter.emit,
  $off: emitter.off
}

export default bus