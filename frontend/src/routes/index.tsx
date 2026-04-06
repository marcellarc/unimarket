import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  return (
    <div>
      <h3>Bem vindo ao UniMarket!</h3>
    </div>
  )
}