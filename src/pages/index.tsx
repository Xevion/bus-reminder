import {
	GetServerSidePropsContext,
	GetServerSidePropsResult,
	NextPage
} from 'next';
import { z } from 'zod';
import { env } from '@/env/server.mjs';
import Editor from 'react-simple-code-editor';
import { useState } from 'react';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-json';
import { fetchConfiguration } from '@/db';
import { useForm } from 'react-hook-form';
import { ConfigurationSchema } from '@/timing';

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

const IndexPage: NextPage<Props> = ({ config }) => {
	const [code, setCode] = useState(config);
	const [valid, setValid] = useState<boolean | null>(null);
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
		setValid(parsedConfig.success);
	}

	return (
		<div className="flex text-zinc-200 bg-zinc-900 min-h-screen max-h-screen h-full flex-col justify-center py-12 sm:px-6 lg:px-8">
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
								highlight={(code) => highlight(code, languages.json)}
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
							<div className="flex-shrink-0">
								<span>
									{valid != null
										? valid
											? 'Valid Configuration'
											: 'Invalid Configuration'
										: null}
								</span>
							</div>
							<div className="flex-shrink-0">
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
		</div>
	);
};

export default IndexPage;
