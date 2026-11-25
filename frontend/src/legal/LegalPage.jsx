import { useEffect } from 'react'
import './legal.css'

function PolicyText({ text, links }) {
  const matches = Object.keys(links)
    .map(label => ({ label, start: text.indexOf(label) }))
    .filter(({ start }) => start >= 0)
    .sort((a, b) => a.start - b.start)

  const parts = matches.flatMap(({ label, start }, index) => {
    const previous = matches[index - 1]
    const offset = previous ? previous.start + previous.label.length : 0
    return [text.slice(offset, start), <a key={start} href={links[label]}>{label}</a>]
  })
  const last = matches.at(-1)

  return <>{parts}{text.slice(last ? last.start + last.label.length : 0)}</>
}

function PolicyBlock({ block, links }) {
  if (block.type === 'heading') return <h3>{block.text}</h3>
  if (block.type === 'list') {
    return <ul>{block.items.map(item => <li key={item}><PolicyText text={item} links={links} /></li>)}</ul>
  }
  return <p><PolicyText text={block.text} links={links} /></p>
}

export default function LegalPage({ policy, isTerms }) {
  useEffect(() => {
    const target = document.getElementById(window.location.hash.slice(1))
    target?.scrollIntoView()
  }, [])

  const otherPage = isTerms
    ? { url: '/privacy/', title: 'Privacy Policy' }
    : { url: '/terms/', title: 'Terms of Use' }

  return (
    <>
      <a className="legal-skip" href="#policy">Skip to policy</a>
      <header className="legal-top">
        <div className="legal-wrap legal-bar">
          <a className="legal-brand" href="/"><img src="/landing/assets/current/linq-icon.png" width="28" height="28" alt="" />LinQ</a>
          <nav className="legal-nav" aria-label="Legal documents">
            <a href="/privacy/" aria-current={isTerms ? undefined : 'page'}>Privacy</a>
            <a href="/terms/" aria-current={isTerms ? 'page' : undefined}>Terms</a>
          </nav>
        </div>
        <div className="legal-wrap legal-intro">
          <a className="legal-home" href="/"><span aria-hidden="true">←</span> Back to LinQ</a>
          <h1>{policy.title}</h1>
          {policy.metadata.length > 0 && (
            <ul className="legal-metadata">{policy.metadata.map(item => <li key={item}>{item}</li>)}</ul>
          )}
        </div>
      </header>

      <main className="legal-wrap legal-layout">
        <nav className="legal-contents" aria-labelledby="contents-heading">
          <h2 id="contents-heading">On this page</h2>
          <ul>{policy.sections.map(section => (
            <li key={section.id}><a href={'#' + section.id}>{section.heading}</a></li>
          ))}</ul>
        </nav>

        <article className="legal-article" id="policy" tabIndex={-1} aria-label={policy.title}>
          {policy.sections.map(section => (
            <section key={section.id} id={section.id} aria-labelledby={section.id + '-heading'}>
              <h2 id={section.id + '-heading'}>{section.heading}</h2>
              {section.blocks.map((block, index) => <PolicyBlock key={index} block={block} links={policy.links} />)}
            </section>
          ))}
        </article>
      </main>

      <footer className="legal-wrap legal-bottom">
        <a href="/">LinQ home</a>
        <a href="/support/">Support</a>
        <a href={otherPage.url}>{otherPage.title}</a>
      </footer>
    </>
  )
}
