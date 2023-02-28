import { AppType } from 'next/app';
import useNProgress from '@/utils/useNProgress';
import '@/styles/globals.scss';
import 'nprogress/nprogress.css';

const MyApp: AppType = ({ Component, pageProps }) => {
	useNProgress();
	return (
		<>
			<Component {...pageProps} />
		</>
	);
};

export default MyApp;
