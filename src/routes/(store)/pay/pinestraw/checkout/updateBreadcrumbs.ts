export function updateBreadcrumbs(
  session: App.Locals['session'],
  newCrumb: { label: string; href?: string }
) {
  return session.update((session) => {
    // add this page to the breadcrumbs if it is not already there.
    // if it is already there, remove everything that occurs in the array after it
    if (session['store.pinestraw.checkout.breadcrumbs']) {
      const index = session['store.pinestraw.checkout.breadcrumbs'].findIndex(
        (crumb) => crumb.label === newCrumb.label
      );
      if (index !== -1) {
        session['store.pinestraw.checkout.breadcrumbs'] = session[
          'store.pinestraw.checkout.breadcrumbs'
        ].slice(0, index + 1);
      } else {
        session['store.pinestraw.checkout.breadcrumbs'] = [
          ...session['store.pinestraw.checkout.breadcrumbs'],
          newCrumb,
        ];
      }
    }
    return session;
  });
}
