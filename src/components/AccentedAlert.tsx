import { ExclamationTriangleIcon } from '@heroicons/react/20/solid';
import clsx from 'clsx';
import { FunctionComponent } from 'react';

// type AccentColors = 'red' | 'yellow' | 'green';
// type AccentColorClass = { base: string; text: string; hover: string };

type AccentedAlertProps = {
  className?: string;
  // color?: AccentColors;
  text: string;
};

const AccentedAlert: FunctionComponent<AccentedAlertProps> = ({
  className,
  text
}) => {
  return (
    <div
      className={clsx(
        className,
        'border-l-4 border-yellow-600 bg-yellow-1000 p-4'
      )}
    >
      <div className="flex">
        <div className="flex-shrink-0">
          <ExclamationTriangleIcon
            className="h-5 w-5 text-yellow-400"
            aria-hidden="true"
          />
        </div>
        <div className="ml-3">
          <p className="text-sm text-yellow-500">
            {text}
            {/*   <a */}
            {/*     href="#" */}
            {/*     className="font-medium text-yellow-700 underline hover:text-yellow-600" */}
            {/*   > */}
            {/*     Upgrade your account to add more credits. */}
            {/*   </a> */}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AccentedAlert;
