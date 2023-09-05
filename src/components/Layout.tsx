import { FunctionComponent } from 'react';
import { classNames } from '@/utils/client';
import Head from 'next/head';

export type LayoutProps = {
	className?: string;
	children: React.ReactNode;
};

const Layout: FunctionComponent<LayoutProps> = ({ children, className }) => {
	return (
		<>
			<Head>
				<title>bus-reminder</title>
			</Head>
			<div
				className={classNames(
					'flex text-zinc-200 bg-zinc-900 min-h-screen h-full flex-col justify-center py-12 sm:px-6 lg:px-8',
					className
				)}
			>
				{children}
			</div>
		</>
	);
};

export default Layout;
