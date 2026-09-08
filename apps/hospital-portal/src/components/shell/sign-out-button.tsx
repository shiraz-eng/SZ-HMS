export function SignOutButton({ tenantId }: { tenantId: string }) {
  return (
    <form action={`/${tenantId}/logout`} method="post">
      <button
        type="submit"
        className="rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-muted-fg hover:bg-muted"
      >
        Sign out
      </button>
    </form>
  );
}
