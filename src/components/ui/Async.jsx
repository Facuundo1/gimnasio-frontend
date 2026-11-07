import { ErrorMessage, Loading } from './States';

/**
 * <Async state={useFetch(...)}>{(data) => <Contenido data={data} />}</Async>
 */
export default function Async({ state, children }) {
  if (state.loading) return <Loading />;
  if (state.data === undefined) return <ErrorMessage error={state.error} onRetry={state.reload} />;
  return children(state.data);
}
