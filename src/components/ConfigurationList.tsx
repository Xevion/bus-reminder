import { FunctionComponent } from 'react';
import { BellIcon, CalendarIcon, ClockIcon } from '@heroicons/react/20/solid';
import {
  type Configuration,
  type DayEnum,
  numberAsDay,
  ParsedTime
} from '@/timing';
import clsx from 'clsx';

export type ConfigurationListProps = {
  configs: Configuration;
};

const shortDays: Record<DayEnum, string> = {
  monday: 'Mon',
  tuesday: 'Tue',
  wednesday: 'Wed',
  thursday: 'Thurs',
  friday: 'Fri',
  saturday: 'Sat',
  sunday: 'Sun'
};

const stringifyParsedTime = (time: ParsedTime): string => {
  let hour = time.hours;
  let postMeridiem = hour >= 12;
  if (postMeridiem) hour -= 12;

  return `${hour.toString().padStart(2, ' ')}:${time.minutes
    .toString()
    .padStart(2, '0')} ${postMeridiem ? 'P' : 'A'}M`;
};

// Stringification function for producing dense but precise weekday information.
// Can produce things like "Mon, Wed, Sat", "Mon", "Sat", "Mon - Sat"
const stringifyDaySet = (days: Set<DayEnum>): string => {
  if (days.size == 0) return 'No days';
  if (days.size == 1) return shortDays[days.values().next().value as DayEnum];

  // Build a sorted array of the day set so we can display it properly
  const array = Array(...days);
  array.sort((a, b) => numberAsDay[a] - numberAsDay[b]);

  // Check if continuous from start to end
  let isContinuous = true;
  let previousDayIndex = numberAsDay[array[0]];
  let current = 0;
  while (current < array.length - 1) {
    current += 1;
    let currentDayIndex = numberAsDay[array[current]];
    // If current day index is previous + 1, then it's still continuous
    if (currentDayIndex !== previousDayIndex + 1) {
      isContinuous = false;
      break;
    }
    previousDayIndex = currentDayIndex;
  }

  if (isContinuous)
    return `${shortDays[array[0]]} - ${shortDays[array[current]]}`;

  return array.map((day) => shortDays[day]).join(', ');
};

const ConfigurationItem: FunctionComponent<{
  title: string;
  isCurrent: boolean;
  days: Set<DayEnum>;
  message: string;
  timeString: string;
}> = ({ title, isCurrent, days, message, timeString }) => {
  return (
    <li>
      <a href="#" className="block bg-zinc-900 hover:bg-zinc-800">
        <div className="px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between">
            <p className="truncate text-sm font-medium text-indigo-500">
              {title}
            </p>
            <div className="ml-2 flex flex-shrink-0">
              <p
                className={clsx(
                  'inline-flex rounded-full px-2 text-xs font-semibold leading-5',
                  isCurrent
                    ? 'bg-[#0B1910] text-[#4E9468]'
                    : 'text-yellow-900 bg-yellow-500/80'
                )}
              >
                Not Current
              </p>
            </div>
          </div>
          <div className="mt-2 sm:flex sm:justify-between">
            <div className="sm:flex">
              <p className="mt-2 flex items-center text-sm text-zinc-500">
                <ClockIcon
                  className="mr-1.5 h-5 w-5 flex-shrink-0 text-zinc-400"
                  aria-hidden="true"
                />
                {timeString}
              </p>
              <p className="flex items-center text-sm text-zinc-500 sm:mt-0 sm:ml-6">
                <BellIcon
                  className="mr-1.5 h-5 w-5 flex-shrink-0 text-zinc-400"
                  aria-hidden="true"
                />
                <span className="truncate pr-2">{message}</span>
              </p>
            </div>
            <div className="mt-2 flex items-center text-sm text-zinc-500 sm:mt-0">
              <CalendarIcon
                className="mr-1.5 h-5 w-5 flex-shrink-0 text-zinc-400"
                aria-hidden="true"
              />
              <p>{stringifyDaySet(days)}</p>
            </div>
          </div>
        </div>
      </a>
    </li>
  );
};

const ConfigurationList: FunctionComponent<ConfigurationListProps> = ({
  configs
}) => {
  return (
    <div className="overflow-hidden max-w-screen-md shadow-lg sm:rounded-md">
      <ul role="list" className="divide-y divide-zinc-800">
        {configs.times.map((config, index) => (
          <ConfigurationItem
            key={index}
            isCurrent={index % 2 == 0}
            days={config.days}
            title={config.name}
            message={config.message}
            timeString={stringifyParsedTime(config.time)}
          />
        ))}
      </ul>
    </div>
  );
};

export default ConfigurationList;
