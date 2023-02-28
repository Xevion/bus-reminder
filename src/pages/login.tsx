import { NextPage } from 'next';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { useRouter } from 'next/router';

const LoginPage: NextPage = () => {
	type FormProps = { token: string };
	const { handleSubmit, register } = useForm<FormProps>();
	const [error, setError] = useState<boolean | null>(null);
	const router = useRouter();

	async function onSubmit(data: FormProps) {
		const response = await fetch(`/api/check?key=${data.token}`);
		if (response.status === 200) {
			setError(false);
			router.push({ pathname: '/', query: { key: data.token } }).then();
		} else setError(true);
	}

	return (
		<div className="flex bg-zinc-900 min-h-screen h-full flex-col justify-center py-12 sm:px-6 lg:px-8">
			<div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
				<div className="bg-black/ py-8 px-4 shadow sm:rounded-lg sm:px-10">
					<form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
						<div>
							<label
								htmlFor="password"
								className="block text-sm font-medium text-gray-400"
							>
								Token
							</label>
							<div className="mt-1">
								<input
									{...register('token', { required: true })}
									className="bg-zinc-800/80 text-zinc-300 block w-full appearance-none rounded-md border border-zinc-700/80 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-800/50 focus:outline-none focus:ring-indigo-500 sm:text-sm"
								/>
							</div>
							{error ? (
								<p className="mt-2 text-sm text-red-600" id="email-error">
									The token given was not valid.
								</p>
							) : null}
						</div>
						<div>
							<button
								type="submit"
								className="flex w-full justify-center rounded-md border border-transparent bg-indigo-700 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700/80 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
							>
								Sign in
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
};

export default LoginPage;
