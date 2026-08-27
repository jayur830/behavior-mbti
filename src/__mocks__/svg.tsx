import type { SVGProps } from 'react';
import { forwardRef } from 'react';

const SvgrMock = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>((props, ref) => {
  return <svg {...props} ref={ref} />;
});

SvgrMock.displayName = 'SvgrMock';

export default SvgrMock;
export const ReactComponent = SvgrMock;
