export const validateDomain = (url) => {
  const domain = url.split('/')[2]
  const array = ['www.tiktok.com', 'vm.tiktok.com']
  const ifDomain = (e) => e === domain
  return array.some(ifDomain)
}
