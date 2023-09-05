import { FunctionComponent } from 'react';
import { classNames } from '@/utils/client';

export type LayoutProps = {
	className?: string;
	children: React.ReactNode;
};

const Layout: FunctionComponent<LayoutProps> = ({ children, className }) => {
	return (
		<div
			className={classNames(
				'flex text-zinc-200 bg-zinc-900 min-h-screen h-full flex-col justify-center py-12 sm:px-6 lg:px-8',
				className
			)}
		>
			{children}
		</div>
	);
};

export default Layout;
