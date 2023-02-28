import {GetServerSidePropsContext, GetServerSidePropsResult, NextPage} from "next";
import {z} from "zod";
import {env} from "@/env/server.mjs";

type Props = {
    authenticated: boolean;
}

export async function getServerSideProps({query}: GetServerSidePropsContext): Promise<GetServerSidePropsResult<Props>> {
    const parsedKey = z.string().safeParse(query?.key);

    if (parsedKey.success && env.API_KEY === parsedKey.data)
        return {
            props: {
                authenticated: true
            }
        }

    return {
        redirect: {
            destination: '/login',
            permanent: false
        }
    }
}

const IndexPage: NextPage<Props> = ({authenticated}) => {
    return <div></div>
}

export default IndexPage;