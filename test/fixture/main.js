import { createToggle } from './toggle.lucy';

export function run() {
  const machine = createToggle().start();
  const before = machine.state;
  machine.send({ type: 'flip' });
  return [before, machine.state];
}
