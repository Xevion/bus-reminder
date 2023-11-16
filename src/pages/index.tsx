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

type IndexPageProps = {
  json: string;
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
        json: superjson.stringify(config)
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

const IndexPage: NextPage<IndexPageProps> = ({ json }) => {
  const config = superjson.parse<Configuration>(json);
  return (
    <Layout className="max-h-screen flex flex-col items-center">
      <ConfigurationList configs={config} />
    </Layout>
  );
};

export default IndexPage;
