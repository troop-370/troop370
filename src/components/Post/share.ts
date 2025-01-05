function share(
  to: 'facebook' | 'twitter' | 'email' | 'linkedin',
  articleName: string,
  articleDescription: string,
  articleLocation: string
): string | undefined {
  const name = encodeURIComponent(articleName);
  const description = encodeURIComponent(articleDescription);
  if (to === 'facebook') {
    const location = encodeURIComponent(
      `${articleLocation}?utm_source=facebook&utm_medium=social&utm_campaign=${name}`
    );
    return `http://www.facebook.com/sharer/sharer.php?quote=${name}&u=${location}`;
  }
  if (to === 'twitter') {
    const location = encodeURIComponent(
      `${articleLocation}?utm_source=twitter&utm_medium=social&utm_campaign=${name}`
    );
    return `http://twitter.com/intent/tweet?text=${name}&url=${location}`;
  }
  if (to === 'email') {
    ``;
    const location = encodeURIComponent(
      `${articleLocation}?utm_source=email&utm_medium=email&utm_campaign=${name}`
    );
    return `mailto:?subject=${name}&body=From%20BSA%20Troop%20270r%3A%0A%0A${name}%0A%0A${description}%0A%0A${location}%0A%0A`;
  }
  if (to === 'linkedin') {
    const location = encodeURIComponent(
      `${articleLocation}?utm_source=linkedin&utm_medium=social&utm_campaign=${name}`
    );
    return `https://www.linkedin.com/sharing/share-offsite/?url=${location}`;
  }
}

export { share };
