import { frameworkUrl } from '../../shared/framework';

export function FrameworkSwitch() {
  return (
    <button
      type="button"
      className="framework-switch"
      role="switch"
      aria-checked={false}
      aria-label="Use Angular version"
      onClick={() => window.location.assign(frameworkUrl('angular'))}
    >
      <span className="selected">React</span>
      <span>Angular</span>
    </button>
  );
}
