import {
	GetServerSidePropsContext,
	GetServerSidePropsResult,
	NextPage
} from 'next';
import { z } from 'zod';
import { env } from '@/env/server.mjs';
import Editor from 'react-simple-code-editor';
import { ReactNode, useState } from 'react';
import { highlight, languages } from 'prismjs';
import 'prismjs/components/prism-json';
import { fetchConfiguration } from '@/db';
import { useForm } from 'react-hook-form';
import { ConfigurationSchema } from '@/timing';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';

type Props = {
	config: string;
};

export async function getServerSideProps({
	query
}: GetServerSidePropsContext): Promise<GetServerSidePropsResult<Props>> {
	const parsedKey = z.string().safeParse(query?.key);

	if (parsedKey.success && env.API_KEY === parsedKey.data) {
		return {
			props: {
				config: JSON.stringify(
					await fetchConfiguration({ times: [] }, false),
					null,
					4
				)
			}
		};
	}

	return {
		redirect: {
			destination: '/login',
			permanent: false
		}
	};
}

const exampleConfiguration = {
	times: [
		{
			time: '03:13',
			maxLate: '00:10',
			message: 'The bus is leaving soon.',
			days: [
				'monday',
				'tuesday',
				'wednesday',
				'thursday',
				'friday',
				'saturday',
				'sunday'
			],
			name: 'B'
		},
		{
			name: 'A',
			message: 'The bus is leaving soon.',
			time: '23:26',
			maxLate: '00:10',
			days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
		}
	]
};

const IndexPage: NextPage<Props> = ({ config }) => {
	const [code, setCode] = useState(config);
	const router = useRouter();
	const [validationElement, setValidationElement] = useState<ReactNode | null>(
		null
	);
	const [parseError, setParseError] = useState<string | any>(null);
	const { register, handleSubmit } = useForm();

	async function onSubmit() {
		const parsedConfig = await ConfigurationSchema.safeParseAsync(
			JSON.parse(code)
		);
		if (!parsedConfig.success) {
			console.log(parsedConfig.error);
			setParseError(parsedConfig.error);
		}
		setValidationElement(
			parsedConfig.success ? 'Valid Configuration' : 'Invalid Configuration'
		);

		if (parsedConfig.success) {
			const response = await fetch(`/api/config?key=${router.query?.key}`, {
				method: 'POST',
				body: code
			});
			console.log(response);
		}
	}

	return (
		<Layout className="max-h-screen">
			<div className="px-5 sm:mx-auto sm:w-full sm:max-w-4xl">
				<div className="bg-black/ py-8 px-4 shadow sm:rounded-lg sm:px-10">
					<form onSubmit={handleSubmit(onSubmit)}>
						<label
							htmlFor="comment"
							className="block text-sm font-medium text-gray-400"
						>
							Modify Configuration
						</label>
						<div
							className="mt-1 min-h-[1rem] overflow-auto"
							style={{ maxHeight: 'calc(100vh - 13rem)' }}
						>
							<Editor
								value={code}
								onValueChange={(code) => setCode(code)}
								highlight={(code) => highlight(code, languages.json, 'json')}
								padding={20}
								preClassName="language-json overflow-y-scroll"
								textareaClassName="border-zinc-700/70 overflow-y-scroll"
								className="text-white w-full rounded-md bg-zinc-800/50 border-zinc-700/70 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
								style={{
									fontFamily: '"Fira code", "Fira Mono", monospace'
								}}
							/>
						</div>
						<div className="flex justify-between pt-2">
							<div className="flex-shrink-0">{validationElement}</div>
							<div className="flex-shrink-0 space-x-4">
								<button
									onClick={(e) => {
										e.preventDefault();
										setCode(JSON.stringify(exampleConfiguration, null, 4));
									}}
									className="inline-flex items-center rounded-md border border-transparent bg-zinc-700 hover:bg-zinc-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
								>
									Load Example
								</button>
								<button
									type="submit"
									className="inline-flex items-center rounded-md border border-transparent bg-indigo-700 hover:bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
								>
									Update
								</button>
							</div>
						</div>
					</form>
				</div>
			</div>
		</Layout>
	);
};

export default IndexPage;
