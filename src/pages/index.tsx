import {
  GetServerSidePropsContext,
  GetServerSidePropsResult,
  NextPage
} from 'next';
import { z } from 'zod';
import { env } from '@/env/server.mjs';
import { fetchConfiguration } from '@/db';
import Layout from '@/components/Layout';
import ConfigurationList from '@/components/ConfigurationList';
import superjson from 'superjson';
import type { Configuration } from '@/timing';
import AccentedAlert from '@/components/AccentedAlert';

type IndexPageProps = {
  json: string;
  error?: string;
};

export async function getServerSideProps({
  query
}: GetServerSidePropsContext): Promise<
  GetServerSidePropsResult<IndexPageProps>
> {
  const parsedKey = z.string().safeParse(query?.key);

  if (parsedKey.success && env.API_KEY === parsedKey.data) {
    const config = await fetchConfiguration({ times: [] }, true);
    return {
      props: {
        json: superjson.stringify(config),
        error: 'NetworkError occurred while fetching resource.'
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

const IndexPage: NextPage<IndexPageProps> = ({ error, json }) => {
  const config = superjson.parse<Configuration>(json);
  const errorElement =
    error != undefined ? (
      <AccentedAlert className="mb-2" text={`An error has occured. ${error}`} />
    ) : undefined;

  return (
    <Layout className="max-h-screen flex flex-col items-center">
      {errorElement}
      <ConfigurationList configs={config} />
    </Layout>
  );
};

export default IndexPage;
