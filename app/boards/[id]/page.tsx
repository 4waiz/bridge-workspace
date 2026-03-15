import { BoardWorkspace } from "@/components/board/board-workspace";

export default async function BoardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <BoardWorkspace boardId={id} />;
}
